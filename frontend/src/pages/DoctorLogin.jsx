import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../redux/authSlice';
import { Lock, Mail, Activity, ArrowRight } from 'lucide-react';
const DoctorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/doctors/signin', { email, password });
            dispatch(setCredentials(data));
            navigate('/doctor/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Provider Credentials');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex-grow flex items-center justify-center py-12 px-4 relative z-10 w-full h-full">
            <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-bl-full opacity-50 -z-10"></div>

                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-textDark tracking-tight">Provider Portal</h2>
                    <p className="text-textMuted mt-2 text-sm">Secure access for verified doctors.</p>
                </div>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 text-center border border-red-100">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-700"
                                placeholder="dr.jane@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="block text-sm font-semibold text-textDark">Password</label>
                            <Link to="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md flex items-center justify-center space-x-2 mt-4 disabled:bg-primary-400">
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Access Dashboard</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
                <p className="mt-8 text-center text-sm text-textMuted font-medium">
                    New to Appointy Provider Network? <Link to="/doctor/signup" className="text-primary-600 hover:text-primary-700 font-bold ml-1">Apply here</Link>
                </p>
                <p className="mt-3 text-center text-xs text-textMuted font-medium">
                    Are you a patient? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold ml-1">Patient Sign In</Link>
                </p>
            </div>
        </div>
    );
};
export default DoctorLogin;