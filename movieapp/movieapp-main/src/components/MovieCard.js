import React, { useState } from 'react';
import axios from 'axios';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';

const MovieCard = ({ movie, isFavourite, onWishlistChange }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(isFavourite);

  const handleAddToWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm phim vào danh sách yêu thích');
        navigate('/auth');
        setLoading(false);
        return;
      }
      await axios.post('http://localhost:5000/api/wishlist', {
        movieId: movie.id?.toString() || movie.movieId?.toString(),
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date || movie.first_air_date,
        media_type: movie.media_type
      }, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      setAdded(true);
      if (onWishlistChange) onWishlistChange();
  
      if (window.notify) window.notify('Đã thêm vào danh sách yêu thích!');
      const token2 = localStorage.getItem('token');
      if (token2) {
        fetch('http://localhost:5000/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token2
          },
          body: JSON.stringify({ message: 'Đã thêm vào danh sách yêu thích!' })
        });
      }
    } catch (error) {
      if (error.response?.status === 400) {
        if (window.notify) window.notify(error.response?.data?.message || 'Có lỗi xảy ra khi thêm phim vào danh sách yêu thích');
        
        return;
      } else if (error.response?.status === 401) {
        if (window.notify) window.notify('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      } else {
        if (window.notify) window.notify('Có lỗi xảy ra khi thêm phim vào danh sách yêu thích');
        console.error('Lỗi khi thêm vào wishlist:', error);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/wishlist/${movie.movieId || movie.id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      setAdded(false);
      if (onWishlistChange) onWishlistChange();
      setTimeout(() => {
        if (window.notify) window.notify('Đã xóa khỏi danh sách yêu thích!');
        const token = localStorage.getItem('token');
        if (token) {
          fetch('http://localhost:5000/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({ message: 'Đã xóa khỏi danh sách yêu thích!' })
          });
        }
      }, 0);
    } catch (error) {
      console.error('Lỗi khi xóa khỏi wishlist:', error);
      alert('Có lỗi xảy ra khi xóa phim khỏi danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  // Lấy image URL từ TMDB 
  const getPosterUrl = () => {
    if (!movie.poster_path) return '';
    if (movie.poster_path.startsWith('http')) return movie.poster_path;
    
    const base = process.env.REACT_APP_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p/original';
    return base + movie.poster_path;
  };

  return (
    <div className="relative group bg-neutral-800 rounded-lg overflow-hidden shadow hover:scale-105 transition-all">
      <Link
        to={`/${movie.media_type || 'movie'}/${movie.movieId || movie.id}`}
        className="block w-full h-full absolute top-0 left-0 z-10"
        style={{ zIndex: 10 }}
      >
        <span className="sr-only">Go to details</span>
      </Link>
      {movie.poster_path ? (
        <img src={getPosterUrl()} alt={movie.title || movie.name} className="w-full h-64 object-cover relative z-0" />
      ) : (
        <div className="w-full h-64 bg-neutral-700 flex items-center justify-center text-white relative z-0">No image</div>
      )}
      <div className="p-4 flex flex-col gap-2 relative z-20">
        <h3 className="text-lg font-semibold line-clamp-1">{movie.title || movie.name}</h3>
        <p className="text-sm text-neutral-400 line-clamp-2">{movie.release_date}</p>
        <p className="text-sm text-yellow-400">Rating: {Number(movie.vote_average).toFixed(1)}</p>
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); added ? handleRemoveFromWishlist() : handleAddToWishlist(); }}
          className={`mt-2 flex items-center justify-center w-full ${added ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white py-2 rounded-md transition-all disabled:opacity-60`}
          disabled={loading || (added && !onWishlistChange)}
        >
          {added ? (
            <>
              <MdFavorite className="mr-2" />
              In Wishlist
            </>
          ) : (
            <>
              <MdFavoriteBorder className="mr-2" />
              Add to Wishlist
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;