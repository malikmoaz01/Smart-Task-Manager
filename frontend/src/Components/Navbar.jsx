import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkSession();

        const sessionInterval = setInterval(checkSession, 30000);

        const handleStorageChange = () => {
            checkSession();
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(sessionInterval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const checkSession = () => {
        try {
            const sessionData = localStorage.getItem('userSession');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const currentTime = new Date().getTime();

                if (currentTime > session.expiryTime) {
                    handleLogout();
                } else {
                    setIsLoggedIn(true);
                    setUser(session.user);
                }
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking session:', error);
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        setIsLoggedIn(false);
        setUser(null);
        setShowProfileDropdown(false);
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">STM</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Smart Task Manager
                            </h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-md"
                        >
                            All Tasks
                        </Link>
                        <Link
                            to="/category"
                            className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-md"
                        >
                            Categories
                        </Link>
                        <Link
                            to="/deadlines"
                            className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-md"
                        >
                            Deadlines
                        </Link>
                        <Link
                            to="/reminders"
                            className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-md"
                        >
                            Reminders
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-3">
                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                                >
                                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-medium">
                                        {getInitials(user?.name)}
                                    </div>
                                    <span className="text-sm font-medium">{user?.name || 'User'}</span>
                                </button>

                                {showProfileDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <LogOut size={16} />
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-700 hover:bg-gray-100 p-2 rounded-md transition"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
                    <div className="px-4 pt-4 pb-2 space-y-2">
                        <Link
                            to="/"
                            className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            All Tasks
                        </Link>
                        <Link
                            to="/category"
                            className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Categories
                        </Link>
                        <Link
                            to="/deadlines"
                            className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Deadlines
                        </Link>
                        <Link
                            to="/reminders"
                            className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Reminders
                        </Link>

                        <div className="pt-4 border-t border-gray-100">
                            {isLoggedIn ? (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3 px-3 py-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {getInitials(user?.name)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                                    >
                                        <LogOut size={16} />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex space-x-2">
                                    <Link
                                        to="/login"
                                        className="flex-1 text-center text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="flex-1 text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Signup
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showProfileDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileDropdown(false)}
                />
            )}
        </nav>
    );
}