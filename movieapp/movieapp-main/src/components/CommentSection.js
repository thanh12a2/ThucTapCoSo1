import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';

//  comment phân cấp
const CommentItem = ({ comment, replies, onReply, onLike, onDelete, userId, movieId }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const liked = comment.likes && Array.isArray(comment.likes) && userId ? comment.likes.includes(userId) : false;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await onReply({
      content: replyContent,
      parentId: comment._id,
    });
    setReplyContent('');
    setShowReply(false);
  };

  return (
    <div className="ml-0 md:ml-4 my-2 border-l-2 border-neutral-700 pl-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white">{comment.user.username}</span>
        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
        {userId === comment.user.id && (
          <button onClick={() => onDelete(comment._id)} className="ml-2 text-red-500 text-xs">Xóa</button>
        )}
      </div>
      <div className="text-white mb-1">{comment.content}</div>
      <div className="flex gap-4 mb-1 items-center">
        <button onClick={() => setShowReply(!showReply)} className="text-sm font-semibold text-blue-400 px-2 py-1 rounded hover:bg-blue-900 transition-all duration-150" style={{fontSize: '1.1rem'}}>{showReply ? 'Hủy' : 'Trả lời'}</button>
        <button onClick={() => onLike(comment._id, liked)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-pink-900 transition-all duration-150" style={{fontSize: '1.3rem'}}>
          {liked ? <AiFillLike className="text-pink-400" style={{fontSize: '1.5em'}} /> : <AiOutlineLike className="text-pink-400" style={{fontSize: '1.5em'}} />}
          <span className="text-base font-semibold text-white" style={{fontSize: '1.1rem'}}>{comment.likes?.length || 0}</span>
        </button>
      </div>
      {showReply && (
        <form onSubmit={handleReply} className="mt-2 flex flex-col gap-1">
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            className="w-full rounded bg-neutral-800 text-white border border-neutral-600 p-1"
            rows={2}
            placeholder="Nhập trả lời..."
            required
          />
          <button type="submit" className="bg-gradient-to-l from-red-500 to-orange-500 text-white rounded px-4 py-2 font-semibold text-base" disabled={false}>
            Gửi trả lời
          </button>
        </form>
      )}
      {replies && replies.length > 0 && (
        <div className="ml-4">
          {replies.map(reply => (
            <CommentItem key={reply._id} comment={reply} replies={reply.replies} onReply={onReply} onLike={onLike} onDelete={onDelete} userId={userId} movieId={movieId} />
          ))}
        </div>
      )}
    </div>
  );
};

const buildTree = (comments) => {
  const map = {};
  comments.forEach(c => (map[c._id] = { ...c, replies: [] }));
  const tree = [];
  comments.forEach(c => {
    if (c.parentId) {
      map[c.parentId]?.replies.push(map[c._id]);
    } else {
      tree.push(map[c._id]);
    }
  });
  return tree;
};

const CommentSection = ({ movieId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/comments/${movieId}`);
      setComments(res.data);
    } catch (err) {
      setComments([]);
    }
  };

  useEffect(() => {
    if (movieId) fetchComments();
  }, [movieId]);

  const handleAddComment = async (extra = {}) => {
    if (!user) return;
    const commentContent = (extra.content !== undefined ? extra.content : content).trim();
    // Lấy userId và username 
    const userId = user._id || user.id;
    const username = user.username || user.name;
   
    console.log('DEBUG gửi comment:', { movieId, userId, username, commentContent });
    if (!commentContent) return;
    if (!movieId || !userId || !username) {
      alert('Thiếu thông tin người dùng hoặc phim!');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/comments`, {
        movieId,
        content: commentContent,
        parentId: extra.parentId || null,
        userId,
        username,
      });
      setContent('');
      fetchComments();
      if (window.notify) window.notify('Bình luận thành công!');
      // Lưu notification vào DB nếu đăng nhập
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${API_BASE_URL}/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ message: 'Bình luận thành công!' })
        });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert('Lỗi: ' + err.response.data.message);
      } else {
        alert('Lỗi gửi bình luận!');
      }
    }
    setLoading(false);
  };

  // Like/unlike handler
  const handleLike = async (commentId, liked) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thích bình luận!');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/comments/${commentId}/like`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      fetchComments();
      if (window.notify) window.notify(liked ? 'Đã bỏ thích bình luận.' : 'Đã thích bình luận!');
      // Lưu notification vào DB nếu đăng nhập
      if (token) {
        fetch(`${API_BASE_URL}/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ message: liked ? 'Đã bỏ thích bình luận.' : 'Đã thích bình luận!' })
        });
      }
    } catch (err) {
      alert('Lỗi khi thích bình luận!');
    }
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    if (!user) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
      fetchComments();
    } catch (err) {}
    setLoading(false);
  };

  const tree = buildTree(comments);

  return (
    <div className="bg-neutral-800 rounded p-4 mt-8 pt-20">
      <h3 className="text-lg font-bold text-white mb-2">Bình luận</h3>
      {user ? (
        <form onSubmit={e => { e.preventDefault(); handleAddComment(); }} className="flex flex-col gap-2 mb-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full rounded bg-neutral-700 text-white border border-neutral-600 p-2"
            rows={2}
            placeholder="Nhập bình luận..."
            required
          />
          <button type="submit" className="bg-gradient-to-l from-red-500 to-orange-500 text-white rounded px-4 py-2 font-semibold" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
        </form>
      ) : (
        <div className="text-center text-gray-400 mb-2">Vui lòng đăng nhập để bình luận</div>
      )}
      <div>
        {tree.length === 0 ? (
          <div className="text-gray-400">Chưa có bình luận nào</div>
        ) : (
          tree.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              replies={comment.replies}
              onReply={handleAddComment}
              onLike={handleLike}
              onDelete={handleDelete}
              userId={user?._id || user?.id}
              movieId={movieId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
