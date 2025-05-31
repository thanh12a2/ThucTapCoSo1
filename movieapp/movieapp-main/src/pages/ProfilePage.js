import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();  const { user, isAuthenticated, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', content: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setMessage({ type: 'error', content: 'Mật khẩu mới không khớp' });
        return;
      }
      if (formData.newPassword === formData.currentPassword) {
        setMessage({ type: 'error', content: 'Hãy đổi mật khẩu khác' });
        return;
      }
    }    try {
      setLoading(true);
      const result = await updateProfile({
        username: formData.username,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || undefined
      });

      if (result.success) {
        setMessage({ type: 'success', content: result.message });
        if (window.notify) window.notify('Đổi mật khẩu/thông tin thành công!');
        
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMessage({ type: 'error', content: result.message });
      }    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: error.message || 'Có lỗi xảy ra khi cập nhật thông tin'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-neutral-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h1>
        
        {message.content && (
          <div className={`p-4 mb-4 rounded ${
            message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}>
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white">
              Tên người dùng
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-400"
              disabled
            />
            <p className="mt-1 text-sm text-neutral-400">
              Email không thể thay đổi
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-700">
            <h2 className="text-lg font-semibold text-white mb-4">Đổi mật khẩu</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-white">
                  Mật khẩu hiện tại
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-white">
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-white">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button              type="submit"
              className={`w-full py-2 px-4 bg-gradient-to-l from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-md transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              Cập nhật thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
