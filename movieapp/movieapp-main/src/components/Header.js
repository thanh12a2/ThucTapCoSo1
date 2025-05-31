import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import userIcon from '../assets/user.png'
import { IoSearchOutline } from "react-icons/io5";
import { navigation } from '../contants/navigation';
import { useAuth } from '../context/authContext';
import { FaUserCircle, FaComments } from 'react-icons/fa';
import { IoMdLogOut } from 'react-icons/io';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Header = ({ toast }) => {
    const location = useLocation()
    const removeSpace = location?.search?.slice(3)?.split("%20")?.join(" ")
    const [searchInput,setSearchInput] = useState(removeSpace)
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(window.scrollY);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(() => {
    
        try {
            const saved = localStorage.getItem('notifications');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [showDropdown, setShowDropdown] = useState(false);
   
    useEffect(()=>{
        if(searchInput){
            navigate(`/search?q=${searchInput}`)
        }
    },[searchInput])

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY < 50) {
                        setShowHeader(true);
                        setLastScrollY(window.scrollY);
                    } else if (window.scrollY > lastScrollY) {
                        setShowHeader(false);
                        setLastScrollY(window.scrollY);
                    } else {
                        setShowHeader(true);
                        setLastScrollY(window.scrollY);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleSubmit = (e)=>{
        e.preventDefault()
    }

    const handleUserMenuToggle = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    
    const notify = (msg) => {
        toast && toast(msg);
        setNotifications(prev => {
            const next = [msg, ...prev].slice(0, 10);
            localStorage.setItem('notifications', JSON.stringify(next));
            return next;
        });
    };
   
    useEffect(() => {
        window.notify = notify;
    }, []);

   
    const handleClearNotifications = () => {
        setNotifications([]);
        localStorage.removeItem('notifications');
    };

    return (
    <header
            className={`fixed top-0 w-full h-16 bg-black bg-opacity-50 z-40 transition-transform duration-300 ${
                showHeader ? 'translate-y-0' : '-translate-y-full'
            }`}
    >
            <div className='container mx-auto px-3 flex items-center h-full'>
                <Link to={"/"}>
                    <img
                        src={logo}
                        alt='logo'
                        width={120} 
                    />
                </Link>

                <nav className='hidden lg:flex items-center gap-1 ml-5'>
                    {
                        navigation.map((nav,index)=>{
                            return(
                                <div key={nav.label+"header"+index}>
                                    <NavLink to={nav.href} className={({isActive})=>`px-2 hover:text-neutral-100 ${isActive && "text-neutral-100"}`}>
                                        {nav.label}
                                    </NavLink>
                                </div>
                            )
                        })
                    }
                </nav>

                <div className='ml-auto flex items-center gap-5'>
                    <form className='flex items-center gap-2' onSubmit={handleSubmit}>
                        <input
                            type='text'
                            placeholder='Search here...'
                            className='bg-transparent px-4 py-1 outline-none border-none hidden lg:block'
                            onChange={(e)=>setSearchInput(e.target.value)}
                            value={searchInput}
                        />
                        <button className='text-2xl text-white'>
                                <IoSearchOutline/>
                        </button>
                    </form>
                    
                    {/* Notification icon */}
                    <div className='relative'>
                        <button onClick={() => setShowNotifications(v => !v)} className='text-2xl text-white relative focus:outline-none'>
                            <IoMdNotificationsOutline />
                            {notifications.length > 0 && (
                                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1'>{notifications.length}</span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className='absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-neutral-800 rounded-md shadow-lg py-2 z-50'>
                                <div className='px-4 py-2 text-sm text-white border-b border-neutral-700 font-bold flex justify-between items-center'>
                                    <span>Thông báo</span>
                                    <button onClick={handleClearNotifications} className='text-xs text-orange-400 hover:underline'>Xóa tất cả</button>
                                </div>
                                {notifications.length === 0 ? (
                                    <div className='px-4 py-2 text-sm text-neutral-400'>Không có thông báo</div>
                                ) : (
                                    notifications.map((msg, idx) => (
                                        <div key={idx} className='px-4 py-2 text-sm text-white border-b border-neutral-700 last:border-b-0'>{msg}</div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {isAuthenticated ? (
                        <div className='relative'>
                            <div 
                                className='w-8 h-8 rounded-full overflow-hidden cursor-pointer active:scale-95 transition-all flex items-center justify-center bg-gradient-to-l from-red-500 to-orange-500 text-white'
                                onClick={handleUserMenuToggle}
                            >
                                {user?.username?.charAt(0).toUpperCase() || <FaUserCircle className='w-full h-full' />}
                            </div>
                            
                            {showUserMenu && (
                                <div className='absolute right-0 mt-2 w-56 bg-neutral-800 rounded-md shadow-lg py-1 z-50'>
                                    <div className='px-4 py-2 text-sm text-white border-b border-neutral-700'>
                                        <p className='font-semibold'>{user?.username}</p>
                                        <p className='text-neutral-400 text-xs truncate'>{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className='w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 flex items-center gap-2'
                                    >
                                        <FaUserCircle />
                                        Chỉnh sửa thông tin
                                    </Link>
                                    <Link
                                        to="/chatbox"
                                        className='w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 flex items-center gap-2'
                                    >
                                        <FaComments />
                                        Chatbox AI
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className='w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 flex items-center gap-2 border-t border-neutral-700'
                                    >
                                        <IoMdLogOut />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='flex items-center gap-2'>
                            <Link 
                                to="/auth" 
                                className='px-4 py-1 rounded-full text-white bg-gradient-to-l from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all text-sm font-medium'
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position='top-right' autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </header>
  )
}

export default Header
