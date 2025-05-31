const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// User Model
const UserSchema = new mongoose.Schema({
  wishlist: [
    {
      movieId: String,
      title: String,
      poster_path: String,
      vote_average: Number,
      release_date: String,
      media_type: String
    }
  ],
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// OTP Model
const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});
const Otp = mongoose.model('Otp', OtpSchema);

// model cmt
const CommentSchema = new mongoose.Schema({
  movieId: { type: String, required: true }, 
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: String
  },
  content: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, 
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
const Comment = mongoose.model('Comment', CommentSchema);

// model Notification 
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
const Notification = mongoose.model('Notification', NotificationSchema);

//cấu hình với nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// Middleware xác thực JWT
function authMiddleware(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movieappsecret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}

// Khởi tạo Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
// Đăng ký
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
    }
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Tạo user mới
    user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'movieappsecret',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
   
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'movieappsecret',
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thông tin người dùng
app.get('/api/user', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movieappsecret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm phim vào wishlist
// Cập nhật thông tin người dùng
app.put('/api/user/profile', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movieappsecret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { username, currentPassword, newPassword } = req.body;

    
    if (username && username !== user.username) {
    
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
      }
      user.username = username;
    }

  
    if (currentPassword && newPassword) {
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
      }

     
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/wishlist', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movieappsecret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { movieId, title, poster_path, vote_average, release_date, media_type } = req.body;

    // Kiểm tra xem phim đã có trong wishlist chưa
    const movieExists = user.wishlist.find(item => item.movieId === movieId);
    if (movieExists) {
      return res.status(400).json({ message: 'Phim đã có trong danh sách yêu thích' });
    }

    user.wishlist.push({
      movieId,
      title,
      poster_path,
      vote_average,
      release_date,
      media_type
    });

    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa phim khỏi wishlist
app.delete('/api/wishlist/:movieId', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movieappsecret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.wishlist = user.wishlist.filter(item => item.movieId !== req.params.movieId);
    await user.save();
    
    res.json(user.wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách phim yêu thích
app.get('/api/wishlist', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movieappsecret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user.wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật thông tin người dùng
app.put('/api/user/profile', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movieappsecret');
    let user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { username, currentPassword, newPassword } = req.body;

    // Kiểm tra xem username mới có bị trùng không (nếu có thay đổi)
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
      }
    }

    // Nếu người dùng muốn đổi mật khẩu
    if (newPassword) {
      // Xác thực mật khẩu hiện tại
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
      }

      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    // Cập nhật username
    user.username = username;

    // Lưu thay đổi
    await user.save();

    res.json({ 
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Lỗi khi cập nhật profile:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});



// API gửi OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await Otp.deleteMany({ email });

    await Otp.create({ email, otp, expiresAt });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã OTP xác thực Movie App',
      text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`
    });
    res.json({ message: 'Đã gửi mã OTP về email.' });
  } catch (err) {
    console.error('Lỗi gửi OTP:', err);
    res.status(500).json({ message: 'Không thể gửi OTP.' });
  }
});

// API xác thực OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Thiếu email hoặc OTP' });
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: 'OTP không đúng' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP đã hết hạn' });
    
    res.json({ message: 'OTP hợp lệ' });
  } catch (err) {
    console.error('Lỗi xác thực OTP:', err);
    res.status(500).json({ message: 'Không thể xác thực OTP.' });
  }
});

// API đổi mật khẩu sau khi xác thực OTP
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('RESET PASSWORD BODY:', req.body); // Debug log
    if (!email || !otp || !newPassword) {
      console.log('Thiếu thông tin:', { email, otp, newPassword });
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Không tìm thấy người dùng:', email);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const record = await Otp.findOne({ email, otp });
    if (!record) {
      console.log('OTP không đúng:', { email, otp });
      return res.status(400).json({ message: 'OTP không đúng' });
    }
    if (record.expiresAt < new Date()) {
      console.log('OTP đã hết hạn:', { email, otp });
      return res.status(400).json({ message: 'OTP đã hết hạn' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    await Otp.deleteMany({ email });
    res.json({ message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', redirect: '/auth' });
  } catch (err) {
    console.error('Lỗi đổi mật khẩu:', err);
    res.status(500).json({ message: 'Không thể đổi mật khẩu.' });
  }
});

// API kiểm tra email đã đăng ký chưa
app.post('/api/auth/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ exists: false, message: 'Thiếu email' });
    const user = await User.findOne({ email });
    if (user) return res.json({ exists: true });
    return res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ exists: false, message: 'Lỗi server' });
  }
});

// API lấy danh sách bình luận phân cấp cho 1 phim
app.get('/api/comments/:movieId', async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.movieId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// API thêm bình luận hoặc trả lời bình luận
app.post('/api/comments', async (req, res) => {
  try {
    const { movieId, content, rating, parentId, userId, username } = req.body;
    if (!movieId || !content || !userId || !username) return res.status(400).json({ message: 'Thiếu thông tin' });
    const comment = await Comment.create({
      movieId,
      content,
      rating,
      parentId: parentId || null,
      user: { id: userId, username }
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Không thể thêm bình luận' });
  }
});

// API xóa bình luận 
app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    // Xóa bình luận cha và tất cả reply con
    await Comment.deleteMany({ $or: [ { _id: commentId }, { parentId: commentId } ] });
    res.json({ message: 'Đã xóa bình luận' });
  } catch (err) {
    res.status(500).json({ message: 'Không thể xóa bình luận' });
  }
});

// API like/unlike 
app.post('/api/comments/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    const userId = req.user.id;
    const liked = comment.likes.includes(userId);
    if (liked) {
      // Hủy like
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      // Thích
      comment.likes.push(userId);
    }
    await comment.save();
    res.json({ liked: !liked, likesCount: comment.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Không thể cập nhật like' });
  }
});

// API notification
app.post('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Thiếu nội dung thông báo' });
    const notification = await Notification.create({
      userId: req.user.id,
      message
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Không thể tạo thông báo' });
  }
});

// API lấy danh sách notification của user
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Không thể lấy danh sách thông báo' });
  }
});

// API đánh dấu đã đọc hoặc xóa notification
app.delete('/api/notifications/:id', authMiddleware, async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Đã xóa thông báo' });
  } catch (err) {
    res.status(500).json({ message: 'Không thể xóa thông báo' });
  }   
});

// API chat với AI
app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let movieList = '';
    let prompt = '';
    let usedActor = false;

    // Phân tích message: nếu hỏi về diễn viên thì lấy phim theo diễn viên
    const actorRegex = /diễn viên ([^\n\r\d.,!?]+)|phim của ([^\n\r\d.,!?]+)|([^\n\r\d.,!?]+) đóng phim gì/i;
    let actorName = null;
    const match = message.match(actorRegex);
    if (match) {
      actorName = match[1] || match[2] || match[3];
      if (actorName) {
        actorName = actorName.trim();
        try {
          // Tìm kiếm diễn viên trên TMDb
          const searchRes = await axios.get('https://api.themoviedb.org/3/search/person', {
            params: { api_key: process.env.TMDB_API_KEY, query: actorName, language: 'vi-VN' }
          });
          if (searchRes.data.results && searchRes.data.results.length > 0) {
            const person = searchRes.data.results[0];
            // Lấy danh sách phim của diễn viên
            const creditsRes = await axios.get(`https://api.themoviedb.org/3/person/${person.id}/movie_credits`, {
              params: { api_key: process.env.TMDB_API_KEY, language: 'vi-VN' }
            });
            const movies = creditsRes.data.cast ? creditsRes.data.cast.slice(0, 15) : [];
            movieList = movies.map(m => `${m.title} (${m.release_date || ''})`).join(', ');
            usedActor = true;
            prompt = `Dưới đây là danh sách phim của diễn viên ${actorName} trên TMDb: ${movieList}\n\nUser: ${message}\nAssistant: Hãy trả lời dựa trên danh sách phim trên. Nếu user hỏi về nội dung phim, hãy mô tả ngắn gọn.`;
          }
        } catch (err) {
          console.error('TMDb actor search error:', err);
        }
      }
    }

    // Nếu không phải hỏi về diễn viên hoặc không tìm được diễn viên, lấy phim trending
    if (!usedActor) {
      try {
        const tmdbRes = await axios.get('https://api.themoviedb.org/3/trending/all/day?language=en-US', {
          params: { api_key: process.env.TMDB_API_KEY, language: 'vi-VN' }
        });
        const movies = tmdbRes.data.results.slice(0, 15); 
        movieList = movies.map(m => `${m.title} (${m.release_date || ''})`).join(', ');
      } catch (tmdbErr) {
        console.error('TMDb error:', tmdbErr);
        movieList = '';
      }
      prompt = `Dưới đây là danh sách phim trending trong ngày trên TMDb: ${movieList}\n\nUser: ${message}\nAssistant: Hãy trả lời dựa trên danh sách phim trên. Nếu user hỏi về diễn viên, hãy gợi ý các diễn viên nổi bật trong các phim này nếu có.`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      message: text,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Không thể kết nối với AI.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));