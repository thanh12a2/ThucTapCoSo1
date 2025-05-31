import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const FavouritePage = () => {
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const fetchFavourites = async () => {
    try {
      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      setFavourites(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu thích:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      }
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, [navigate, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập để xem danh sách phim yêu thích</h2>
        <button 
          onClick={() => navigate('/auth')}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20 py-8">
      <h1 className="text-3xl font-bold mb-6">Phim Yêu Thích</h1>
      {favourites.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có phim yêu thích nào</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {favourites.map((movie) => (
            <MovieCard
              key={movie.movieId}
              movie={movie}
              isFavourite={true}
              onWishlistChange={fetchFavourites}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouritePage;