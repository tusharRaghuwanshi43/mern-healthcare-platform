import React, { useEffect, useState, useRef } from 'react'; // <-- Import useRef
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState(token ? 'verifying' : 'pending');
    const [message, setMessage] = useState('');
    const [wasAlreadyVerified, setWasAlreadyVerified] = useState(false);

    // NEW: Create a ref to track if we've already made the API call
    const hasFetched = useRef(false);

    useEffect(() => {
        if (status !== 'verifying') return;

        // NEW: If we've already fetched, stop right here!
        if (hasFetched.current) return;

        // NEW: Mark as fetched so the second Strict Mode call gets blocked
        hasFetched.current = true;

        const verify = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/auth/verify/${token}`);

                setStatus('success');
                setMessage(data.message);

                if (data.alreadyVerified) {
                    setWasAlreadyVerified(true);
                }

            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed or link expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token, status]);

    return (
        <div className="flex-grow flex items-center justify-center py-20 px-4 relative overflow-hidden bg-slate-50">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="bg-white/80 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/60 relative z-10 text-center">

                {status === 'pending' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                            <Mail className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Check Your Email!</h2>
                        <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                            A verification link has been sent to your inbox. <br />
                            Please check your email to verify your account before logging in.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 hover:-translate-y-1"
                        >
                            <span>Proceed to Login</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Loader className="w-10 h-10 text-primary-500 animate-spin" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Verifying Identity</h2>
                        <p className="text-slate-500 font-medium">Securing your account with our health network. Please wait...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>

                        <h2 className="text-3xl font-extrabold text-slate-800 mb-4 text-center">
                            {wasAlreadyVerified
                                ? 'Already Authenticated'
                                : 'Verification Complete'}
                        </h2>

                        <p className="text-slate-600 font-medium mb-8 leading-relaxed text-center px-4">
                            {wasAlreadyVerified
                                ? 'Your account was already authenticated. No further action is required.'
                                : 'Your identity has been successfully verified. Your account is now active and secure.'}
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center space-x-2 hover:-translate-y-1"
                        >
                            <span>Proceed to Login</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Verification Failed</h2>
                        <p className="text-red-600 font-semibold mb-2">{message}</p>
                        <p className="text-slate-500 text-sm mb-8 px-4">
                            The link may have expired or was already used. Please try registering again or contact support.
                        </p>
                        <div className="flex flex-col w-full space-y-3">
                            <Link to="/signup" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl transition-all text-center">
                                Back to Signup
                            </Link>
                            <Link to="/" className="text-slate-500 font-bold hover:text-slate-800 transition-colors text-sm">
                                Return to Homepage
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mt-12 flex items-center justify-center space-x-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest">End-to-End Encrypted Verification</span>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;