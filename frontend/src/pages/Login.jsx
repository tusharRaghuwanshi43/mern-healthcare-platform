import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import logo from '../assets/logo.png';
import { setCredentials } from '../redux/authSlice';
import { Lock, Mail, Activity, ArrowRight, UserSquare, Stethoscope, Eye, EyeOff } from 'lucide-react';
const Login = () => {
    const [activeTab, setActiveTab] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return setError('Please enter a valid email address.');
        }
        if (password.length < 8) {
            return setError('Password must be at least 8 characters long.');
        }

        setLoading(true);
        try {
            const url = activeTab === 'doctor' ? '/api/doctors/signin' : '/api/auth/login';
            const { data } = await api.post(url, { email, password });
            dispatch(setCredentials(data));
            if (data.role === 'doctor') navigate('/doctor/dashboard');
            else if (data.role === 'admin') navigate('/admin/dashboard');
            else navigate('/patient/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid Credentials';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };
    const handleGoogleSuccess = async (credentialResponse) => {
        if (activeTab === 'doctor') {
            setError('Providers must use email login.');
            return;
        }
        try {
            const { data } = await api.post('/api/auth/google', {
                idToken: credentialResponse.credential,
                role: 'patient'
            });
            dispatch(setCredentials(data));
            navigate('/patient/dashboard');
        } catch (err) {
            setError('Google Sign-In Failed');
        }
    };
    return (
        <div className="flex-grow flex items-center justify-center py-12 px-4 relative w-full h-full min-h-screen bg-slate-50 overflow-hidden">
            {/* Vibrant Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/60 dark:border-slate-800 relative z-10 backdrop-blur-xl bg-white/90 dark:bg-slate-900/95">

                <div className="mb-8 text-center">
                    {/* Logo */}
                    <div className="inline-flex items-center justify-center space-x-2 mb-6">
                        <img src={logo} alt="logo" className="h-9 mt-4 w-auto object-contain" />
                        <span className="font-extrabold mr-7 mt-6 text-2xl text-slate-800 dark:text-white tracking-tight">Appointy</span>
                    </div>
                    <h2 className="text-3xl font-[1000] bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Secure access to your healthcare portal.</p>
                </div>
                {/* Unified Tab Selector */}
                <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800 rounded-2xl mb-8 border border-slate-200/50 dark:border-slate-700 backdrop-blur-sm relative">
                    <button
                        onClick={() => { setActiveTab('patient'); setError(''); }}
                        className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all z-10 ${activeTab === 'patient' ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <UserSquare className="w-4 h-4 mr-2" />
                        Patient
                    </button>
                    <button
                        onClick={() => { setActiveTab('doctor'); setError(''); }}
                        className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all z-10 ${activeTab === 'doctor' ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Stethoscope className="w-4 h-4 mr-2" />
                        Care Partner
                    </button>

                    {/* Sliding indicator */}
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-700 rounded-xl shadow-md transition-all duration-300 ease-in-out ${activeTab === 'patient' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
                </div>
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold mb-6 text-center border border-red-100">{error}</div>}
                <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 dark:text-slate-200 font-medium"
                                placeholder={activeTab === 'patient' ? "name@example.com" : "dr.name@hospital.com"}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                            <Link to="#" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">Forgot?</Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 font-medium"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center space-x-2 mt-4 hover:-translate-y-0.5 disabled:opacity-70">
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Sign In to {activeTab === 'patient' ? 'Portal' : 'Workspace'}</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
                {activeTab === 'patient' && (
                    <>
                        <div className="mt-8 mb-6 relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Or continue with
                            </div>
                        </div>
                        <div className="flex justify-center flex-col items-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Authentication Failed')}
                                theme="outline"
                                size="large"
                                width="100%"
                                shape="pill"
                            />
                        </div>
                    </>
                )}
                <p className="mt-8 text-center text-sm text-slate-600 font-medium">
                    Don't have an account?
                    <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-bold ml-1.5 transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};
export default Login;