import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import logo from '../assets/logo.png';
import loginBg from '../assets/login.png'; // Sửa đường dẫn import

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { login, register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển hướng về trang chủ
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Xóa lỗi khi chuyển đổi giữa đăng nhập và đăng ký
    clearError();
  }, [isAuthenticated, navigate, isLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!isLogin && !formData.username.trim()) {
      errors.username = 'Tên người dùng là bắt buộc';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isLogin) {
      await login({ email: formData.email, password: formData.password });
    } else {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    clearError();
    setFormErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4"
         style={{
           backgroundImage: `url(${loginBg})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      <div className="max-w-md w-full space-y-8 bg-neutral-800/90 backdrop-blur-sm p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <img src={logo} alt="Logo" className="mx-auto h-16" />
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md text-center">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Tên người dùng
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    formErrors.username ? 'border-red-500' : 'border-gray-600'
                  } bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                  placeholder="Tên người dùng"
                />
                {formErrors.username && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-500' : 'border-gray-600'
                } bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                placeholder="Email"
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-500' : 'border-gray-600'
                } bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                placeholder="Mật khẩu"
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  } bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                  placeholder="Xác nhận mật khẩu"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-l from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <button
            onClick={toggleForm}
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            {isLogin
              ? 'Chưa có tài khoản? Đăng ký ngay'
              : 'Đã có tài khoản? Đăng nhập'}
          </button>
          {isLogin && (
            <div className="mt-2">
              <a
                href="/forgot-password"
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                Quên mật khẩu?
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;