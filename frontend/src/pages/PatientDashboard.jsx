import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, LogOut, Home, Search, History, Settings, Activity, User, Star, FileText, CreditCard, ShieldAlert, Phone, Mail } from 'lucide-react';
import { setCredentials, logout } from '../redux/authSlice';
const PatientDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewDoctor, setReviewDoctor] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewedDoctors, setReviewedDoctors] = useState([]);
    // Prescription View State
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [activePrescription, setActivePrescription] = useState(null);
    const [fetchingPrescription, setFetchingPrescription] = useState(false);
    // Recent Prescriptions
    const [recentPrescriptions, setRecentPrescriptions] = useState([]);
    // Profile Settings State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: userInfo?.name || '', age: '', gender: 'Prefer not to say', phone: '', address: '', medicalNotes: '', profilePhoto: null });
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/appointments/myappointments', config);
                setAppointments(data);
                // Fetch recent prescriptions from completed appointments
                const completed = data.filter(a => a.status === 'completed' && a.prescription);
                const prescriptions = [];
                for (const apt of completed.slice(0, 3)) {
                    try {
                        const rxRes = await axios.get(`http://localhost:5000/api/appointments/${apt._id}/prescription`, config);
                        prescriptions.push({ ...rxRes.data, appointmentId: apt._id, doctorInfo: apt.doctor });
                    } catch (e) { /* skip if not found */ }
                }
                setRecentPrescriptions(prescriptions);
            } catch (error) {
                console.error("Error fetching patient appointments:", error);
                toast.error(error.response?.data?.message || 'Failed to fetch appointments.');
            } finally {
                setLoading(false);
            }
        };
        const fetchUserProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
                setProfileForm({
                    name: data.name || '',
                    age: data.age || '',
                    gender: data.gender || 'Prefer not to say',
                    phone: data.phone || '',
                    address: data.address || '',
                    medicalNotes: data.medicalNotes || '',
                    profilePhoto: null
                });
                if (data.profilePhoto) setProfilePhotoPreview(data.profilePhoto);
            } catch (error) {
                console.error("Error fetching patient profile:", error);
                toast.error(error.response?.data?.message || 'Failed to fetch profile.');
            }
        };
        if (userInfo) {
            fetchAppointments();
            fetchUserProfile();
        }
    }, [userInfo]);
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReview(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(`http://localhost:5000/api/doctors/${reviewDoctor._id}/reviews`, reviewForm, config);
            setReviewedDoctors(prev => [...prev, reviewDoctor._id]);
            toast.success('Review submitted successfully!');
            setIsReviewModalOpen(false);
            setReviewForm({ rating: 5, comment: '' });
            setReviewDoctor(null);
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error(error.response?.data?.message || 'Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };
    const handleViewPrescription = async (appointmentId) => {
        try {
            setFetchingPrescription(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/appointments/${appointmentId}/prescription`, config);
            setActivePrescription(data);
            setIsPrescriptionModalOpen(true);
        } catch (error) {
            console.error("Error fetching prescription:", error);
            toast.error(error.response?.data?.message || 'Prescription not available yet.'); // Replaced alert
        } finally {
            setFetchingPrescription(false);
        }
    };
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setUpdatingProfile(true);
            const formData = new FormData();
            formData.append('name', profileForm.name || '');
            formData.append('age', profileForm.age || '');
            formData.append('gender', profileForm.gender || 'Prefer not to say');
            formData.append('phone', profileForm.phone || '');
            formData.append('address', profileForm.address || '');
            formData.append('medicalNotes', profileForm.medicalNotes || '');

            if (profileForm.profilePhoto) {
                formData.append('profilePhoto', profileForm.profilePhoto);
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            const { data } = await axios.put('http://localhost:5000/api/users/profile', formData, config);
            dispatch(setCredentials({ ...userInfo, ...data })); // Sync with Redux
            toast.success('Profile updated successfully!'); // Replaced alert
            setIsProfileModalOpen(false);
            if (data.profilePhoto) setProfilePhotoPreview(data.profilePhoto);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || 'Failed to update profile.'); // Replaced alert
        } finally {
            setUpdatingProfile(false);
        }
    };
    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete('http://localhost:5000/api/users/profile', config);
                toast.success("Account deleted successfully."); // Replaced alert
                dispatch(logout());
                navigate('/');
            } catch (error) {
                console.error("Error deleting account:", error);
                toast.error(error.response?.data?.message || 'Failed to delete account.'); // Replaced alert
            }
        }
    };
    // Derived filtered lists
    const pendingConfirmed = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
    const historyAppointments = appointments.filter(a => ['completed', 'rejected', 'cancelled'].includes(a.status));

    const isProfileComplete = profileForm.age && profileForm.phone && profileForm.medicalNotes;
    const renderAppointmentCard = (apt, showActions = true) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            key={apt._id}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                    <img src={apt.doctor?.profilePhoto || 'https://via.placeholder.com/150'} alt={apt.doctor?.name} className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-100" />
                    <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{apt.doctor?.name}</h3>
                        <p className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-md inline-block mt-1">{apt.doctor?.specialty}</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center text-sm font-medium text-slate-600 border border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(apt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                    <Clock className="w-4 h-4 text-secondary-500" />
                    <span className="text-slate-800 font-bold">{apt.timeSlot}</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${apt.status === 'completed' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    apt.status === 'confirmed' ? 'bg-green-50 text-green-600 border border-green-100' :
                        apt.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            apt.status === 'rejected' ? 'bg-red-50 text-red-500 border border-red-100' :
                                'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                    {apt.status}
                </span>
                <div className="flex space-x-2">
                    {/* Confirmed: show Pay Now */}
                    {apt.status === 'confirmed' && apt.paymentStatus !== 'paid' && (
                        <button
                            onClick={() => navigate('/checkout', { state: { amount: apt.consultationFee, appointmentId: apt._id } })}
                            className="text-xs font-bold bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-xl flex items-center transition-colors shadow-sm shadow-green-500/30"
                        >
                            <CreditCard className="w-3.5 h-3.5 mr-1" />
                            Pay Now
                        </button>
                    )}
                    {apt.status === 'confirmed' && apt.paymentStatus === 'paid' && (
                        <span className="text-xs font-bold bg-green-50 text-green-600 px-3 py-1.5 rounded-xl border border-green-100">Paid ✓</span>
                    )}
                    {showActions && apt.status === 'completed' && (
                        <>
                            <button onClick={() => handleViewPrescription(apt._id)} className="w-8 h-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center transition-colors" title="View Prescription">
                                <FileText className="w-4 h-4" />
                            </button>
                            {!reviewedDoctors.includes(apt.doctor?._id) && (
                                <button onClick={() => { setReviewDoctor(apt.doctor); setIsReviewModalOpen(true); }} className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1.5 rounded-xl flex items-center transition-colors">
                                    <Star className="w-3.5 h-3.5 mr-1" />
                                    Rate
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden w-full">

            {/* Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between hidden md:flex shadow-sm z-20">
                <div>
                    <div className="p-6">
                        <Link to="/" className="flex items-center space-x-2 font-bold text-2xl text-primary-600 tracking-tight">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-lg shadow-sm">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span>Appointy</span>
                        </Link>
                    </div>
                    <div className="px-4 py-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Main Menu</div>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'overview' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <Home className="w-5 h-5" />
                                <span>Overview</span>
                            </button>
                            <Link
                                to="/doctors"
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700`}
                            >
                                <Search className="w-5 h-5" />
                                <span>Find Doctors</span>
                            </Link>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'history' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <History className="w-5 h-5" />
                                <span>Medical History</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'settings' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <Settings className="w-5 h-5" />
                                <span>Settings</span>
                            </button>
                        </nav>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold overflow-hidden shadow-sm">
                            {profilePhotoPreview ? (
                                <img src={profilePhotoPreview} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                userInfo?.name?.charAt(0)
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{userInfo?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{userInfo?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-100 p-4 flex justify-between items-center z-30 shadow-sm">
                <div className="flex items-center space-x-2 font-bold text-xl text-primary-600">
                    <Activity className="w-6 h-6" />
                    <span>Appointy</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-10">
                <div className="max-w-6xl mx-auto p-6 lg:p-8">

                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 md:mt-0">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome, {userInfo?.name?.split(' ')[0]} 👋</h1>
                            <p className="text-slate-500 font-medium mt-1">Here is the overview of your health schedule.</p>
                        </div>
                        <Link
                            to="/doctors"
                            className="mt-4 md:mt-0 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center space-x-2"
                        >
                            <Search className="w-4 h-4" />
                            <span>Book New Appointment</span>
                        </Link>
                    </div>
                    {/* ====== OVERVIEW TAB ====== */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Upcoming (Pending + Confirmed) Appointments */}
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-xl font-extrabold text-slate-800 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                                    Upcoming Consultations
                                </h2>
                                {loading ? (
                                    <div className="flex justify-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                    </div>
                                ) : pendingConfirmed.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pendingConfirmed.map((apt) => renderAppointmentCard(apt, false))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Calendar className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">No Active Appointments</h3>
                                        <p className="text-slate-500 text-sm mb-6">You don't have any upcoming consultations scheduled.</p>
                                        <Link to="/doctors" className="text-primary-600 font-bold hover:text-primary-700 bg-primary-50 px-6 py-2.5 rounded-full transition-colors">Find a Doctor</Link>
                                    </div>
                                )}
                            </div>
                            {/* Sidebar Extras Column */}
                            <div className="space-y-6">
                                {!isProfileComplete ? (
                                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                        <h3 className="text-xl font-bold mb-2 relative z-10">Digital Health Profile</h3>
                                        <p className="text-primary-100 text-sm mb-6 relative z-10">Keep your health records secured and synchronized across devices.</p>
                                        <div onClick={() => { setActiveTab('settings'); setIsProfileModalOpen(true); }} className="flex items-center space-x-3 text-sm font-bold bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20 w-max cursor-pointer hover:bg-white/20 transition-colors">
                                            <User className="w-4 h-4" />
                                            <span>Complete your profile</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 rounded-full blur-2xl group-hover:bg-primary-100 transition-colors"></div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1 relative z-10">Quick Actions</h3>
                                        <p className="text-slate-500 text-xs mb-5 relative z-10">Manage your health journey</p>

                                        <div className="space-y-3 relative z-10">
                                            <button onClick={() => navigate('/doctors')} className="w-full bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-bold py-3 px-4 rounded-xl border border-slate-100 hover:border-primary-100 transition-all flex items-center group-hover:shadow-sm">
                                                <Search className="w-4 h-4 mr-3 text-primary-500" /> Book Consultation
                                            </button>
                                            <button onClick={() => setActiveTab('history')} className="w-full bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold py-3 px-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all flex items-center group-hover:shadow-sm">
                                                <History className="w-4 h-4 mr-3 text-indigo-500" /> View Medical History
                                            </button>
                                            <button onClick={() => setActiveTab('settings')} className="w-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold py-3 px-4 rounded-xl border border-slate-100 hover:border-emerald-100 transition-all flex items-center group-hover:shadow-sm">
                                                <Settings className="w-4 h-4 mr-3 text-emerald-500" /> Account Settings
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* Recent Prescriptions Widget */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-secondary-500" />
                                        Recent Prescriptions
                                    </h3>
                                    {recentPrescriptions.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentPrescriptions.map((rx, idx) => (
                                                <div key={idx} onClick={() => { setActivePrescription(rx); setIsPrescriptionModalOpen(true); }} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-colors">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">Rx</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-slate-800 text-sm truncate">Dr. {rx.doctorInfo?.name || rx.doctor?.name}</p>
                                                            <p className="text-xs text-slate-500">{new Date(rx.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">{rx.medicines?.map(m => m.name).join(', ')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-sm text-slate-500 font-medium">
                                            No recent prescriptions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* ====== MEDICAL HISTORY TAB ====== */}
                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-extrabold text-slate-800 flex items-center">
                                <History className="w-5 h-5 mr-2 text-primary-500" />
                                Medical History
                            </h2>
                            {loading ? (
                                <div className="flex justify-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                </div>
                            ) : historyAppointments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {historyAppointments.map((apt) => renderAppointmentCard(apt, true))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
                                    <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Medical History</h3>
                                    <p className="text-slate-500">Your past records and completed consultations will appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Account Settings</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Manage your personal information and preferences.</p>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="lg:w-1/3 flex flex-col items-center text-center">
                                    <div className="w-32 h-32 rounded-[2rem] bg-primary-50 border-4 border-white shadow-lg overflow-hidden mb-4 relative flex items-center justify-center text-4xl font-bold text-primary-300">
                                        {profilePhotoPreview ? (
                                            <img src={profilePhotoPreview} alt="User Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            userInfo?.name?.charAt(0)
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{userInfo?.name}</h3>
                                    <p className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg mt-2 inline-flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {userInfo?.email}</p>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 top-border border-slate-100 pt-2">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Age & Gender</p>
                                            <p className="font-bold text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary-400" />
                                                {profileForm.age ? `${profileForm.age} yrs, ` : ''}
                                                {profileForm.gender || 'Not Specified'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Phone Number</p>
                                            <p className="font-bold text-slate-700 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-primary-400" />
                                                {profileForm.phone || 'Not Provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2"><Activity className="w-4 h-4" /> Medical Notes</h4>
                                        <p className="text-sm font-medium text-amber-700/80 leading-relaxed shadow-inner bg-white/50 p-4 rounded-xl border border-amber-200/50">
                                            {profileForm.medicalNotes || "No medical history notes added yet. Keep this updated for your Care Partners."}
                                        </p>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-slate-100">
                                        <button onClick={() => setIsProfileModalOpen(true)} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center space-x-2">
                                            <Settings className="w-5 h-5" /> <span>Update Profile Details</span>
                                        </button>
                                        <button onClick={handleDeleteAccount} className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm">
                                            <ShieldAlert className="w-5 h-5" /> <span>Delete Account</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
            {/* Review Modal */}
            {isReviewModalOpen && reviewDoctor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 p-8 border border-white">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full mx-auto mb-3 shadow-md border-4 border-slate-50 overflow-hidden">
                                <img src={reviewDoctor.profilePhoto || 'https://via.placeholder.com/150'} alt="Doc" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Rate Dr. {reviewDoctor.name}</h2>
                            <p className="text-sm font-medium text-slate-500">Share your experience to help others.</p>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                            <div className="flex justify-center space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} className={`text-5xl transition-transform hover:scale-110 focus:outline-none ${reviewForm.rating >= star ? 'text-amber-400 drop-shadow-md' : 'text-slate-200'}`}>
                                        ★
                                    </button>
                                ))}
                            </div>
                            <div>
                                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows="4" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none font-medium text-slate-700 transition-all text-sm" placeholder="Write your feedback..." required />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors w-full sm:w-auto">Cancel</button>
                                <button type="submit" disabled={submittingReview} className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                                    {submittingReview ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Prescription Modal */}
            {isPrescriptionModalOpen && activePrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPrescriptionModalOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto border border-white hide-scrollbar">

                        <div className="flex items-center space-x-3 mb-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <div className="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">Rx</div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800">Digital Prescription</h2>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Official Medical Record</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Doctor</p>
                                <p className="font-bold text-slate-800 text-lg">Dr. {activePrescription.doctor?.name || activePrescription.doctorInfo?.name}</p>
                                <p className="text-sm font-medium text-primary-600">{activePrescription.doctor?.specialty || activePrescription.doctorInfo?.specialty}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                                <p className="font-bold text-slate-800 text-lg">{activePrescription.patient?.name || userInfo?.name}</p>
                                <p className="text-sm font-medium text-slate-500">Issued: {new Date(activePrescription.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Medications</h3>
                                <div className="grid gap-3">
                                    {activePrescription.medicines.map((med, idx) => (
                                        <div key={idx} className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{med.name}</h4>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{med.dosage}</span>
                                                    {med.notes && <span className="text-xs italic text-slate-500">• {med.notes}</span>}
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm whitespace-nowrap">
                                                {med.duration}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {activePrescription.generalInstructions && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Instructions</h3>
                                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-sm font-medium text-amber-900 leading-relaxed shadow-sm">
                                        {activePrescription.generalInstructions}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end pt-8 mt-4">
                            <button onClick={() => setIsPrescriptionModalOpen(false)} className="px-8 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-lg transition-all hover:-translate-y-0.5">
                                Close Prescription
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Profile Settings Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto border border-white hide-scrollbar">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold shadow-sm"><User className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-800">Complete Your Profile</h2>
                                <p className="text-sm font-medium text-slate-500">Keep your health records up to date.</p>
                            </div>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Photo Upload */}
                                <div className="flex flex-col items-center justify-center md:w-1/3">
                                    <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer hover:border-primary-400 transition-colors">
                                        {profilePhotoPreview ? (
                                            <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                        ) : (
                                            <div className="text-slate-400 flex flex-col items-center"><User className="w-8 h-8 mb-2" /><span className="text-xs font-bold uppercase">Upload</span></div>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setProfileForm({ ...profileForm, profilePhoto: file });
                                                setProfilePhotoPreview(URL.createObjectURL(file));
                                            }
                                        }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">Profile Image</p>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                        <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-700 transition-all text-sm" required />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1/2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Age</label>
                                            <input type="number" value={profileForm.age} onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-700 transition-all text-sm" />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Gender</label>
                                            <select value={profileForm.gender} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-700 transition-all text-sm">
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                                <option>Prefer not to say</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                                        <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-700 transition-all text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Address / Location</label>
                                <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-700 transition-all text-sm mb-6" placeholder="City, State, Country" />
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Medical Notes / Allergies</label>
                                <textarea value={profileForm.medicalNotes} onChange={(e) => setProfileForm({ ...profileForm, medicalNotes: e.target.value })} rows="3" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none font-medium text-slate-700 transition-all text-sm" placeholder="Any specific conditions or allergies to note..."></textarea>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100 space-x-3">
                                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                                <button type="submit" disabled={updatingProfile} className="px-8 py-3 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                                    {updatingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
export default PatientDashboard;