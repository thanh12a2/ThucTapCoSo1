import React, { useState } from 'react';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  
  const API_BASE_URL = 'http://localhost:5000/api'; 

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
 
      const check = await axios.post(`${API_BASE_URL}/auth/check-email`, { email });
      if (!check.data.exists) {
        setMessage('Email này chưa được đăng ký tài khoản.');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, { email });
      setStep(2);
      setMessage('Mã OTP đã được gửi về email của bạn.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Không thể gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { 
        email, 
        otp 
      });
      setStep(3);
      setMessage('OTP hợp lệ. Hãy nhập mật khẩu mới.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newPassword.length < 6) {
      setMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
     
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { 
        email, 
        otp, 
        newPassword 
      });
      setMessage('Đổi mật khẩu thành công! Đang chuyển hướng...');
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1500);
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="max-w-md w-full bg-neutral-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Quên mật khẩu</h2>
        {message && <div className="mb-4 p-2 rounded text-white bg-red-500">{message}</div>}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-white mb-1">Nhập email đăng ký</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                required
              />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-gradient-to-l from-red-500 to-orange-500 text-white font-semibold rounded-md" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-white mb-1">Nhập mã OTP</label>
              <input
                type="password"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 tracking-widest"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-gradient-to-l from-red-500 to-orange-500 text-white font-semibold rounded-md" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-white mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                required
              />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-gradient-to-l from-red-500 to-orange-500 text-white font-semibold rounded-md" disabled={loading}>
              {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;