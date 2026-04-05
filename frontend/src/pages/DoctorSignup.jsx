import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { setCredentials } from '../redux/authSlice';
import { User, Lock, Mail, Image as ImageIcon, Briefcase, DollarSign, Clock, ShieldCheck, FileText, MapPin } from 'lucide-react';
const DoctorSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialty: '',
        experienceYears: '',
        consultationFee: '',
        bio: '',
        address: ''
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Required to send files
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });

        if (profilePhoto) {
            submitData.append('profilePhoto', profilePhoto);
        }

        // Mock default availability for now
        const defaultAvailability = [
            { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM'] },
            { day: 'Wednesday', slots: ['01:00 PM', '02:00 PM'] }
        ];
        submitData.append('availability', JSON.stringify(defaultAvailability));
        try {
            const { data } = await api.post('/api/doctors/signup', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Provider profile created! Please verify your email.');
            setSignupSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to register. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex-grow flex items-center justify-center py-10 px-4 relative z-10 w-full h-full overflow-y-auto hide-scrollbar">
            <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-2xl w-full max-w-2xl border border-slate-100 relative overflow-hidden my-auto">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-50 rounded-full opacity-50 -z-10 blur-3xl"></div>

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-textDark tracking-tight">Provider Registration</h2>
                    <p className="text-textMuted mt-2 text-sm">Join our network of top-rated healthcare professionals.</p>
                </div>
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
                            onClick={() => navigate('/doctor/login')}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                            <span>Proceed to Login</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 text-center border border-red-100">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Photo Upload Section */}
                            <div className="flex flex-col items-center justify-center mb-4">
                                <div className="relative w-28 h-28 mb-3 group">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full rounded-full object-cover border-4 border-primary-100 shadow-sm" />
                                    ) : (
                                        <div className="w-full h-full rounded-full border-4 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:border-primary-200 group-hover:text-primary-500 transition-colors cursor-pointer">
                                            <ImageIcon className="w-8 h-8 mb-1" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Photo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required={!photoPreview}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 font-medium">Upload a professional headshot (JPG, PNG)</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Basic Info */}
                                <div>
                                    <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Full Name (with Title)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                                        <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Dr. Jane Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                                        <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="dr.jane@example.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                                        <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="••••••••" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Specialty</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Briefcase className="h-5 w-5 text-slate-400" /></div>
                                        <select name="specialty" required value={formData.specialty} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-700 appearance-none">
                                            <option value="" disabled>Select Specialty</option>
                                            <option value="Cardiologist">Cardiologist</option>
                                            <option value="Dermatologist">Dermatologist</option>
                                            <option value="Neurologist">Neurologist</option>
                                            <option value="Pediatrician">Pediatrician</option>
                                            <option value="Orthopedic">Orthopedic</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Experience (Years)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Clock className="h-5 w-5 text-slate-400" /></div>
                                        <input type="number" name="experienceYears" min="0" required value={formData.experienceYears} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="10" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Consultation Fee ($)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><DollarSign className="h-5 w-5 text-slate-400" /></div>
                                        <input type="number" name="consultationFee" min="0" required value={formData.consultationFee} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="150" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Clinic/Hospital Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-slate-400" /></div>
                                        <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="123 Medical Park, New Delhi" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-textDark mb-1.5 ml-1">Professional Bio</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-4 pointer-events-none"><FileText className="h-5 w-5 text-slate-400" /></div>
                                    <textarea name="bio" required value={formData.bio} onChange={handleInputChange} rows="3" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none" placeholder="Briefly describe your background, philosophy, and approach to patient care..."></textarea>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md flex items-center justify-center space-x-2 mt-2 disabled:bg-primary-400">
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Create Provider Account</span>
                                        <ShieldCheck className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
                <p className="mt-6 text-center text-sm text-textMuted font-medium">
                    Already a provider? <Link to="/doctor/login" className="text-primary-600 hover:text-primary-700 font-bold ml-1">Sign in here</Link>
                </p>
            </div>
        </div>
    );
};
export default DoctorSignup;