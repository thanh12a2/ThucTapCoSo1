import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra người dùng đã đăng nhập chưa khi tải trang
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const config = {
            headers: {
              'x-auth-token': token
            }
          };
          
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/user`, config);
          
          setUser(res.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  // Đăng ký người dùng
  const register = async (formData) => {
    try {
      setError(null);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/register`, formData);
      
      localStorage.setItem('token', res.data.token);
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký');
      return false;
    }
  };

  // Đăng nhập
  const login = async (formData) => {
    try {
      setError(null);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, formData);
      
      localStorage.setItem('token', res.data.token);
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
      return false;
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Xóa thông báo lỗi
  const clearError = () => {
    setError(null);
  };

  // Cập nhật thông tin người dùng
  const updateProfile = async (formData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const apiUrl = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL + '/user/profile'
        : '/api/user/profile';
      const res = await axios.put(
        apiUrl,
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUser(res.data.user);
      return { success: true, message: res.data.message };
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      return { success: false, message: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);