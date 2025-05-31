import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatboxPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    scrollToBottom();
  }, [messages, isAuthenticated, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', 
        { message: inputMessage },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const aiMessage = {
        text: response.data.message,
        sender: 'ai',
        timestamp: new Date(response.data.timestamp)
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      if (window.notify) {
        window.notify('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{marginTop: '40px'}}>
      <div className="max-w-2xl mx-auto bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-neutral-900 border-b border-neutral-700">
          <h1 className="text-xl font-bold text-white">Chat với AI Trợ lý</h1>
        </div>
        
        {/* Messages container */}
        <div className="h-[400px] p-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                'flex ' + (message.sender === 'user' ? 'justify-end' : 'justify-start') + ' mb-4'
              }
            >
              <div
                className={
                  'max-w-[70%] rounded-lg p-3 ' +
                  (message.sender === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-neutral-700 text-white')
                }
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-neutral-700 text-white rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            />            <button
              type="submit"
              disabled={isLoading}
              className={
                'px-6 py-2 bg-gradient-to-l from-red-500 to-orange-500 text-white rounded-md font-semibold hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-all ' +
                (isLoading ? 'cursor-not-allowed' : '')
              }
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatboxPage;
