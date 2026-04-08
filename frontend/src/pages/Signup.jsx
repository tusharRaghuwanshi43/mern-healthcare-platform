import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import logo from '../assets/logo.png';
import { setCredentials } from '../redux/authSlice';
import { User, Lock, Mail, Activity, ArrowRight, ShieldCheck, UserSquare, Stethoscope, MapPin, Eye, EyeOff } from 'lucide-react';
const Signup = () => {
    const [activeTab, setActiveTab] = useState('patient');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Prefer not to say');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [medicalNotes, setMedicalNotes] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handlePatientSignup = async (e) => {
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
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', 'patient');
            if (age) formData.append('age', age);
            if (gender) formData.append('gender', gender);
            if (phone) formData.append('phone', phone);
            if (address) formData.append('address', address);
            if (medicalNotes) formData.append('medicalNotes', medicalNotes);
            if (profilePhoto) formData.append('profilePhoto', profilePhoto);
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await api.post('/api/auth/register', formData, config);

            toast.success('Account created! Please verify your email.');
            setSignupSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };
    const handleGoogleSuccess = async (credentialResponse) => {
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
        <div className="flex-grow flex items-center justify-center py-10 px-4 relative w-full h-full min-h-screen bg-slate-50 overflow-hidden">
            {/* Professional Blue Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
            <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/60 relative z-10 backdrop-blur-xl bg-white/90">
                {signupSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100 animate-bounce">
                            <Mail className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Verification Email Sent!</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            A secure verification link has been sent to your inbox.<br />
                            Please click the link in your email to activate your account before logging in.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                            <span>Proceed to Login</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 text-center">
                            {/* Logo */}
                            <div className="inline-flex items-center justify-center space-x-2 mb-6">
                                <img src={logo} alt="logo" className="h-9 mt-4 w-auto object-contain" />
                                <span className="font-extrabold mr-7 mt-6 text-2xl text-slate-800 dark:text-white tracking-tight">Appointy</span>
                            </div>
                            <h2 className="text-3xl font-[1000] bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-500 tracking-tight">Create Account</h2>
                            <p className="text-slate-500 text-sm">Join the platform to manage your healthcare seamlessly.</p>
                        </div>
                        {/* Unified Tab Selector */}
                        <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200/50 backdrop-blur-sm relative">
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
                            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out ${activeTab === 'patient' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
                        </div>
                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold mb-6 text-center border border-red-100">{error}</div>}
                        {activeTab === 'patient' ? (
                            <>
                                <form onSubmit={handlePatientSignup} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                            </div>
                                            <input
                                                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 font-medium"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                            </div>
                                            <input
                                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 font-medium"
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
                                        <div className="relative group mb-4">
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Age</label>
                                            <input
                                                type="number" value={age} onChange={(e) => setAge(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 outline-none font-medium text-slate-700 text-sm"
                                                placeholder="e.g. 30"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Gender</label>
                                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 outline-none font-medium text-slate-700 text-sm">
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                                <option>Prefer not to say</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Phone Number</label>
                                        <input
                                            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 outline-none font-medium text-slate-700 text-sm"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Address / Location</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                            </div>
                                            <input
                                                type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 font-medium text-sm"
                                                placeholder="City, State, ZIP"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Medical Notes (Optional)</label>
                                        <textarea
                                            value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} rows="2"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 outline-none font-medium text-slate-700 text-sm resize-none"
                                            placeholder="Any chronic conditions or allergies..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Profile Photo (Optional)</label>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                                {profilePhotoPreview ? <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-400" />}
                                            </div>
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setProfilePhoto(file);
                                                    setProfilePhotoPreview(URL.createObjectURL(file));
                                                }
                                            }} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-lg shadow-blue-700/30 flex items-center justify-center space-x-2 mt-4 hover:-translate-y-0.5 disabled:opacity-70">
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>Create Account</span>
                                                <ShieldCheck className="w-5 h-5 ml-1" />
                                            </>
                                        )}
                                    </button>
                                </form>
                                <div className="mt-8 mb-6 relative flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200"></div>
                                    </div>
                                    <div className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Or signup with
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
                                        text="signup_with"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6 px-4 bg-primary-50/50 border border-primary-100 rounded-2xl">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                    <Stethoscope className="w-8 h-8 text-primary-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Join the Provider Network</h3>
                                <p className="text-slate-600 text-sm mb-6">Doctor registration requires professional verification, specialty details, and availability configuration.</p>
                                <button
                                    onClick={() => navigate('/doctor/signup')}
                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                                >
                                    <span>Proceed to Provider Portal</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="mt-8 text-center text-sm text-slate-600 font-medium">
                            Already have an account?
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold ml-1.5 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
export default Signup;