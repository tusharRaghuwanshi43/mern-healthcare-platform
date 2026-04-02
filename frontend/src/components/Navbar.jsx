import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Activity, LogOut, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home'); // Track active section

    const isDashboard = location.pathname.includes('dashboard');
    const isLanding = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll Spy Logic for Landing Page
    useEffect(() => {
        if (!isLanding) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Adjust these to change when a section becomes "active"
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Assuming your landing page has sections with these IDs
        const sections = ['home', 'about', 'doctors'].map(id => document.getElementById(id)).filter(Boolean);
        sections.forEach(section => observer.observe(section));

        // Fallback for when at the very top
        const handleTopScroll = () => {
            if (window.scrollY < 100) setActiveSection('home');
        };
        window.addEventListener('scroll', handleTopScroll);

        return () => {
            sections.forEach(section => observer.unobserve(section));
            window.removeEventListener('scroll', handleTopScroll);
        };
    }, [isLanding]);


    const scrollToTop = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveSection('home');
        }
        setMobileMenuOpen(false);
        setProfileOpen(false);
    };

    const scrollToSection = (e, sectionId) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById(sectionId);
            if (element) {
                const navHeight = 64;
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - navHeight,
                    behavior: 'smooth'
                });
                setActiveSection(sectionId);
            }
        }
        setMobileMenuOpen(false);
    };

    if (isDashboard) return null;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setMobileMenuOpen(false);
        setProfileOpen(false);
    };

    const navClasses = scrolled
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-sm'
        : 'bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800';

    // Updated getLinkClass to use the new activeSection state
    const getLinkClass = (sectionId) => {
        const isActive = isLanding ? activeSection === sectionId : location.pathname === `/${sectionId === 'home' ? '' : sectionId}`;
        return `text-l font-bold transition-all duration-200 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`;
    };

    return (
        <nav className={`fixed w-full top-0 z-[100] transition-all duration-300 ${navClasses}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">

                {/* Logo */}
                <Link to="/" onClick={scrollToTop} className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-primary-700 transition-colors">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Appointy</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex flex-1 justify-center space-x-8 items-center">
                    {userInfo ? (
                        <>
                            <Link to={userInfo.role === 'doctor' ? "/doctor/dashboard" : "/patient/dashboard"} className={getLinkClass('dashboard')}>Dashboard</Link>
                            <Link to="/doctors" className={getLinkClass('doctors')}>Find Care Partners</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" onClick={scrollToTop} className={getLinkClass('home')}>Home</Link>
                            <a href="/#about" onClick={(e) => scrollToSection(e, 'about')} className={getLinkClass('about')}>About</a>
                            <a href="/#doctors" onClick={(e) => scrollToSection(e, 'doctors')} className={getLinkClass('doctors')}>Our Partners</a>
                        </>
                    )}
                </div>

                {/* Desktop Auth Buttons + Theme Toggle */}
                <div className="hidden md:flex items-center space-x-4">
                    {userInfo ? (
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity bg-slate-50 dark:bg-slate-800 py-1.5 pl-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-700"
                            >
                                {userInfo.profilePhoto ? (
                                    <img src={userInfo.profilePhoto} alt="User" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-l font-bold border border-slate-200 dark:border-slate-600">
                                        {userInfo.name?.charAt(0)?.toUpperCase()}{userInfo.name?.split(' ')[1]?.charAt(0)?.toUpperCase() || ''}
                                    </div>
                                )}
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">{userInfo.name?.split(' ')[0]}</span>
                                {/* Animated Chevron Down */}
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Desktop Profile Dropdown */}
                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2"
                                    >
                                        <Link
                                            to={userInfo.role === 'doctor' ? "/doctor/dashboard" : "/patient/dashboard"}
                                            onClick={() => setProfileOpen(false)}
                                            className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                                        >
                                            Dashboard
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-l px-2 font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign In</Link>
                            <Link to="/signup" className="bg-slate-900 px-2 dark:bg-primary-600 hover:bg-slate-800 dark:hover:bg-primary-700 text-white text-l font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm">Get Started</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <button className="text-slate-600 dark:text-slate-300 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Animated Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-white dark:bg-slate-900 shadow-lg border-b border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="px-4 py-4 flex flex-col space-y-2">
                            {userInfo ? (
                                <>
                                    <Link to={userInfo.role === 'doctor' ? "/doctor/dashboard" : "/patient/dashboard"} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-semibold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">Dashboard</Link>
                                    <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-semibold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">Find Care Partners</Link>
                                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-base font-semibold text-red-600 dark:text-red-400 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/" onClick={scrollToTop} className={`px-3 py-2 text-base font-semibold rounded-lg ${activeSection === 'home' ? 'text-primary-600 bg-primary-50 dark:bg-slate-800' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Home</Link>
                                    <a href="/#about" onClick={(e) => scrollToSection(e, 'about')} className={`px-3 py-2 text-base font-semibold rounded-lg ${activeSection === 'about' ? 'text-primary-600 bg-primary-50 dark:bg-slate-800' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>About</a>
                                    <a href="/#doctors" onClick={(e) => scrollToSection(e, 'doctors')} className={`px-3 py-2 text-base font-semibold rounded-lg ${activeSection === 'doctors' ? 'text-primary-600 bg-primary-50 dark:bg-slate-800' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Our Partners</a>
                                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-semibold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">Sign In</Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-semibold text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20">Get Started</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;