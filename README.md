Hướng dẫn cài đặt & chạy project

1. Cài đặt dependencies cho frontend
<pre> cd movieapp-main
npm install </pre>
2. Cài đặt dependencies cho backend
<pre> cd backend
npm install </pre>

3. Chạy project
- Mở 2 terminal:
  
   +) Terminal 1: Chạy backend
<pre> cd backend
 node server.js </pre>
   +) Terminal 2: Chạy frontend
<pre> cd movieapp-main
npm start </pre>
- Lưu ý:

+) Đảm bảo bạn đã cài đặt Node.js, MongoDB và npm trên máy.

+) Nếu có file .env.example thì copy thành .env và điền các biến môi trường cần thiết (nếu có).
