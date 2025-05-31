import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-8 border-t border-neutral-800 mt-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between gap-8 text-sm">
        {/* Logo & Mô tả lớn */}
        <div className="flex-1 min-w-[250px] flex flex-col justify-center items-start mb-8 md:mb-0">
          <div className="flex items-center gap-3 mb-4">
            <img src={require('../assets/logo.png')} alt="Logo" className="h-16 w-auto max-w-[120px] object-contain" />
            
          </div>
          <p className="text-neutral-300 text-lg md:text-xl leading-relaxed font-medium max-w-xl">
            Moiveo - Website xem phim trực tuyến chất lượng cao, cập nhật phim mới nhất vietsub mỗi ngày, xem miễn phí hàng nghìn bộ phim HD/4K đa thể loại.
          </p>
        </div>
        {}
        <div>
          <h3 className="text-orange-400 font-bold mb-2">Trợ giúp</h3>
          <ul className="space-y-1">
            <li>Hỏi đáp</li>
            <li>Liên hệ</li>
            <li>Tin tức</li>
          </ul>
        </div>
        {}
        <div>
          <h3 className="text-orange-400 font-bold mb-2">Thông tin</h3>
          <ul className="space-y-1">
            <li>Điều khoản sử dụng</li>
            <li>Chính sách riêng tư</li>
            <li>Khuyến nghị bản quyền</li>
            <li className="text-xs mt-2">© {new Date().getFullYear()} Created by Le Thanh</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
