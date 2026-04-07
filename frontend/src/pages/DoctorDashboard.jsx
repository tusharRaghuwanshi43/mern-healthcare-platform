import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { logout, setCredentials } from '../redux/authSlice';
import logo from '../assets/logo.png';
import { Calendar, Clock, LogOut, Home, Users, Settings, Activity, Star, ClipboardList, Wallet, Camera, Edit3, ClipboardCheck, Mail, Phone, X, ChevronRight, MapPin, ShieldAlert, Search } from 'lucide-react';
const DoctorDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    // Edit Profile Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', specialty: '', experienceYears: '', consultationFee: '', bio: '', address: '' });
    const [editPhoto, setEditPhoto] = useState(null);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    // Prescription Modal State
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [prescriptionApt, setPrescriptionApt] = useState(null);
    const [prescriptionForm, setPrescriptionForm] = useState({ medicines: [{ name: '', dosage: '', duration: '', notes: '' }], generalInstructions: '' });
    const [submittingPrescription, setSubmittingPrescription] = useState(false);
    // Availability Modal State
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [availabilityForm, setAvailabilityForm] = useState([]);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);
    const fetchDashboardData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const aptRes = api.get('/api/appointments/doctor', config);
            const profRes = api.get('/api/doctors/me', config);
            const revRes = api.get(`/api/doctors/${userInfo._id}/reviews`);
            const bookedRes = api.get('/api/appointments/myappointments', config);
            const [appointmentsData, profileData, reviewsData, bookedData] = await Promise.all([aptRes, profRes, revRes, bookedRes]);
            setAppointments(appointmentsData.data);
            setDoctorProfile(profileData.data);
            setReviews(reviewsData.data);
            setBookedAppointments(bookedData.data);
            if (profileData.data) {
                setEditForm({
                    name: profileData.data.name || '',
                    specialty: profileData.data.specialty || '',
                    experienceYears: profileData.data.experienceYears || '',
                    consultationFee: profileData.data.consultationFee || '',
                    bio: profileData.data.bio || '',
                    address: profileData.data.address || ''
                });
                const defaultDays = [
                    { day: 'Monday', slots: [] }, { day: 'Tuesday', slots: [] }, { day: 'Wednesday', slots: [] },
                    { day: 'Thursday', slots: [] }, { day: 'Friday', slots: [] }, { day: 'Saturday', slots: [] }, { day: 'Sunday', slots: [] }
                ];
                const savedAvail = profileData.data.availability || [];
                const mergedAvail = defaultDays.map(dDay => {
                    const found = savedAvail.find(sDay => sDay.day === dDay.day);
                    return found || dDay;
                });
                setAvailabilityForm(mergedAvail);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to fetch dashboard data.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (userInfo && userInfo.role === 'doctor') {
            fetchDashboardData();
        }
    }, [userInfo]);
    if (!userInfo || userInfo.role !== 'doctor') return <Navigate to="/login" replace />;
    const handleLogout = () => dispatch(logout());
    // Update handlers...
    const handleUpdateStatus = async (appointmentId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await api.patch(`/api/appointments/${appointmentId}/status`, { status }, config);
            setAppointments(appointments.map(apt => apt._id === appointmentId ? { ...apt, status } : apt));
            fetchDashboardData(); // Refresh data after status update
        } catch (error) {
            console.error("Error updating appointment:", error);
            toast.error("Failed to update status");
        }
    };
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setUpdatingProfile(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } };
            const formData = new FormData();
            Object.keys(editForm).forEach(key => formData.append(key, editForm[key]));
            if (editPhoto) formData.append('profilePhoto', editPhoto);
            const { data } = await api.put('/api/doctors/me', formData, config);
            setDoctorProfile(data);
            dispatch(setCredentials({ ...userInfo, ...data })); // Update user info in Redux store
            toast.success('Profile updated successfully!');
            setIsEditModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdatingProfile(false);
        }
    };
    const handlePrescriptionSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmittingPrescription(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await api.post(`/api/appointments/${prescriptionApt._id}/prescription`, prescriptionForm, config);
            setAppointments(appointments.map(apt => apt._id === prescriptionApt._id ? { ...apt, status: 'completed' } : apt));
            toast.success('Prescription added successfully!');
            setIsPrescriptionModalOpen(false);
            setPrescriptionApt(null);
            setPrescriptionForm({ medicines: [{ name: '', dosage: '', duration: '', notes: '' }], generalInstructions: '' });
            fetchDashboardData(); // Refresh appointments
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit prescription');
        } finally {
            setSubmittingPrescription(false);
        }
    };
    const handleAvailabilitySubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdatingAvailability(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            // Note: The instruction had 'multipart/form-data' for availability, but JSON is more appropriate here.
            // Assuming the backend expects JSON for availability update.
            await api.put('/api/doctors/me', { availability: availabilityForm }, config);
            setDoctorProfile(prev => ({ ...prev, availability: availabilityForm })); // Update local state
            setIsAvailabilityModalOpen(false);
            toast.success('Availability updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update availability');
        } finally {
            setUpdatingAvailability(false);
        }
    };
    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to permanently delete your Care Partner account? This action cannot be undone.")) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await api.delete('/api/doctors/me', config);
                toast.success("Account deleted successfully.");
                dispatch(logout());
                navigate('/'); // Redirect to home or login page
            } catch (error) {
                console.error("Error deleting account:", error);
                toast.error(error.response?.data?.message || 'Failed to delete account.');
            }
        }
    };
    const handleSlotChange = (dayIndex, slotValue, action) => {
        const updated = [...availabilityForm];
        if (action === 'add' && slotValue && !updated[dayIndex].slots.includes(slotValue)) {
            updated[dayIndex].slots.push(slotValue);
        } else if (action === 'remove') {
            updated[dayIndex].slots = updated[dayIndex].slots.filter(s => s !== slotValue);
        }
        setAvailabilityForm(updated);
    };
    // Metrics calculation
    const currentMonth = new Date().getMonth();
    const monthlyEarnings = appointments.filter(a => (a.status === 'completed' || a.status === 'confirmed') && new Date(a.date).getMonth() === currentMonth)
        .reduce((sum, current) => sum + (current.consultationFee || 0), 0);
    const totalEarnings = appointments.filter(a => a.status === 'completed' || a.status === 'confirmed')
        .reduce((sum, current) => sum + (current.consultationFee || 0), 0);
    const uniquePatientsCount = new Set(appointments.map(a => a.patient?._id)).size;
    const rating = doctorProfile?.averageRating || 0;
    const totalReviews = doctorProfile?.totalReviews || 0;
    const uniquePatientsMap = new Map();
    appointments.forEach(a => {
        if (a.patient && a.patient._id && !uniquePatientsMap.has(a.patient._id)) {
            uniquePatientsMap.set(a.patient._id, a.patient);
        }
    });
    const uniquePatientsList = Array.from(uniquePatientsMap.values());
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden w-full">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between hidden md:flex shadow-sm z-20">
                <div>
                    <div className="p-6">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 group">
                            <img src={logo} alt="logo" className="h-10 mb-3 w-auto object-contain" />
                            <span className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">
                                Appointy
                            </span>
                        </Link>
                    </div>
                    <div className="px-4 py-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Workspace</div>
                        <nav className="space-y-1">
                            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'overview' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                <Home className="w-5 h-5" />
                                <span>Overview</span>
                            </button>
                            <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'appointments' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                <Calendar className="w-5 h-5" />
                                <span>Schedule</span>
                            </button>
                            <button onClick={() => setActiveTab('patients')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'patients' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                <Users className="w-5 h-5" />
                                <span>Patients Database</span>
                            </button>
                            <button onClick={() => setActiveTab('careHistory')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'careHistory' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                <ClipboardList className="w-5 h-5" />
                                <span>Health Record</span>
                            </button>
                            <Link to="/doctors" className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700`}>
                                <Search className="w-5 h-5" />
                                <span>Find Care Partners</span>
                            </Link>
                            <button onClick={() => setIsAvailabilityModalOpen(true)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700`}>
                                <Clock className="w-5 h-5" />
                                <span>Availability</span>
                            </button>
                            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                <Settings className="w-5 h-5" />
                                <span>Profile & Settings</span>
                            </button>
                        </nav>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                        <img src={userInfo?.profilePhoto || 'https://via.placeholder.com/150'} alt="Provider" className="w-10 h-10 rounded-full border-2 border-primary-200 object-cover" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{userInfo?.name?.startsWith('Dr.') ? userInfo?.name : `Dr. ${userInfo?.name?.split(' ')[0]}`}</p>
                            <p className="text-xs font-medium text-primary-600 truncate">{doctorProfile?.specialty || 'General'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-all">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-100 p-4 flex justify-between items-center z-30 shadow-sm">
                <div className="flex items-center space-x-2 font-bold text-xl text-primary-600">
                    <Activity className="w-6 h-6" />
                    <span>Appointy Pro</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
            {/* Main Content Area */}
            <div className="flex-1 max-h-screen overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-10 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 md:mt-0">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Care Partner Dashboard</h1>
                            <p className="text-slate-500 font-medium mt-1">Hello {userInfo?.name?.startsWith('Dr.') ? userInfo?.name : `Dr. ${userInfo?.name}`}, here is today's overview.</p>
                        </div>
                    </div>
                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-blue-50/80 p-3 rounded-2xl text-blue-600 border border-blue-100"><Calendar className="w-6 h-6" /></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Lifetime</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-slate-800 mb-1">{appointments.length}</div>
                                    <div className="text-sm font-medium text-slate-500">Total Consultations</div>
                                </div>
                                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-green-50/80 p-3 rounded-2xl text-green-600 border border-green-100"><Wallet className="w-6 h-6" /></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Financials</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-slate-800 mb-1">${totalEarnings}</div>
                                    <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md self-start mt-1 cursor-help" title={`Monthly: $${monthlyEarnings}`}>+${monthlyEarnings} this month</div>
                                </div>
                                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-purple-50/80 p-3 rounded-2xl text-purple-600 border border-purple-100"><Users className="w-6 h-6" /></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Database</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-slate-800 mb-1">{uniquePatientsCount}</div>
                                    <div className="text-sm font-medium text-slate-500">Unique Patients</div>
                                </div>
                                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-amber-50/80 p-3 rounded-2xl text-amber-500 border border-amber-100"><Star className="w-6 h-6" /></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Reputation</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-slate-800 flex items-baseline gap-1">
                                        {rating} <span className="text-lg text-slate-400">/ 5</span>
                                    </div>
                                    <div className="text-sm font-medium text-slate-500">From {totalReviews} reviews</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Upcoming Schedule Panel */}
                                <div className="xl:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-primary-500" /> Action Required Queue
                                        </h2>
                                        <button onClick={() => setActiveTab('appointments')} className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">View Schedule →</button>
                                    </div>
                                    {loading ? (
                                        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
                                    ) : (
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                                            {appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).map(apt => (
                                                <div key={apt._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white hover:border-primary-100 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <img src={apt.patient?.profilePhoto || `https://ui-avatars.com/api/?name=${apt.patient?.name || 'X'}&background=c084fc&color=fff`} className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-200" alt="Patient" />
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">{apt.patient?.name || 'Unknown Patient'}</h4>
                                                            <div className="flex items-center gap-2 text-xs font-bold mt-1">
                                                                <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md border border-primary-100">{new Date(apt.date).toLocaleDateString()}</span>
                                                                <span className="bg-white text-secondary-500 border border-slate-200 px-2 py-0.5 rounded-md">{apt.timeSlot}</span>
                                                            </div>
                                                            {(apt.patient?.age || apt.patient?.gender) && (
                                                                <div className="text-[10px] text-slate-500 mt-1 uppercase font-semibold tracking-wider">
                                                                    {apt.patient?.age ? `${apt.patient.age} Yrs, ` : ''}{apt.patient?.gender || ''} {apt.patient?.phone ? `• ${apt.patient.phone}` : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="hidden md:flex flex-col items-end sm:items-center text-sm">
                                                        <span className="font-extrabold text-slate-700">${apt.consultationFee}</span>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 mt-1 rounded-md ${apt.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                            {apt.paymentStatus === 'paid' ? 'Paid ✓' : 'Payment Pend.'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        {apt.status === 'pending' ? (
                                                            <>
                                                                <button onClick={() => handleUpdateStatus(apt._id, 'confirmed')} className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold shadow-sm shadow-green-500/30 transition-all">Accept</button>
                                                                <button onClick={() => handleUpdateStatus(apt._id, 'rejected')} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-bold transition-all">Decline</button>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => { setPrescriptionApt(apt); setIsPrescriptionModalOpen(true); }} className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                                                                <ClipboardCheck className="w-4 h-4" /> Issue Rx
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length === 0 && (
                                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                                    <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="font-medium text-slate-500 text-sm">Your queue is fully cleared.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Reviews & Rating Panel */}
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                        <Star className="w-5 h-5 text-amber-500" /> Patient Feedback
                                    </h2>
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 hide-scrollbar">
                                        {reviews.length > 0 ? reviews.map(rev => (
                                            <div key={rev._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-sm text-slate-800">{rev.patient?.name || 'Anonymous'}</span>
                                                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-bold border border-amber-100 shadow-sm flex items-center gap-1">
                                                        {rev.rating} <Star className="w-3 h-3 fill-amber-500" />
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-600 italic">"{rev.comment}"</p>
                                            </div>
                                        )) : (
                                            <div className="text-center py-10">
                                                <p className="font-medium text-slate-400 text-sm">No reviews yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'appointments' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="text-primary-500" /> Complete Schedule Archive
                            </h2>
                            {/* Reusing the same render pipeline for all appointments */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {appointments.map((apt) => (
                                    <div key={apt._id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-12 h-12 -mx-6 -my-6 rounded-full opacity-20 blur-xl ${apt.status === 'completed' ? 'bg-indigo-500' :
                                            apt.status === 'confirmed' ? 'bg-green-500' :
                                                apt.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${apt.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                                                apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <img src={apt.patient?.profilePhoto || `https://ui-avatars.com/api/?name=${apt.patient?.name || 'X'}&background=0f172a&color=fff`} className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-200" alt="Patient" />
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{apt.patient?.name || 'Unknown Patient'}</h4>
                                                <div className="text-xs font-bold text-slate-500">{new Date(apt.date).toLocaleDateString()} @ {apt.timeSlot}</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                                            <div className="text-xs text-slate-500 truncate max-w-[120px]" title={apt.patient?.medicalNotes}>{apt.patient?.medicalNotes || 'No medical notes'}</div>
                                            <div className="text-right flex flex-col items-end">
                                                <span className="text-sm font-extrabold text-slate-700">${apt.consultationFee}</span>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 mt-1 rounded-md border ${apt.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-500 border-amber-100'}`}>
                                                    {apt.paymentStatus === 'paid' ? 'Paid ✓' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'profile' && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-8 lg:p-12 shadow-sm border border-slate-100">
                            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-100 pb-10 mb-10">
                                <div className="relative w-40 h-40 group cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                                    <div className="w-full h-full border-4 border-primary-100 rounded-[2rem] p-1 shadow-lg bg-white relative overflow-hidden transform rotate-3 transition-transform group-hover:rotate-0">
                                        <img src={userInfo.profilePhoto || 'https://via.placeholder.com/150'} className="w-full h-full rounded-2xl object-cover border border-slate-100" alt="Doctor" />
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-primary-600 rounded-2xl text-white flex items-center justify-center shadow-lg border-2 border-white transform -rotate-6 group-hover:rotate-0 transition-transform">
                                        <Edit3 className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 mb-1">{userInfo.name}</h2>
                                    <p className="text-lg font-bold text-primary-600 mb-4">{doctorProfile?.specialty || 'General Practitioner'} <span className="text-slate-300 mx-2">•</span> {doctorProfile?.experienceYears || 0} Years Exp.</p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm flex gap-2"><Wallet className="w-4 h-4 text-green-500" /> ${doctorProfile?.consultationFee || 0} / Session</div>
                                        <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm flex gap-2"><Star className="w-4 h-4 text-amber-500" /> {rating}/5 Rating</div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList className="text-primary-500" /> Professional Biography</h3>
                                    <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                                        {doctorProfile?.bio || "No professional biography provided yet."}
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 text-primary-600"><Settings className="text-primary-400 w-5 h-5" /> Location & Logisitics</h3>
                                    <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Clinic/Hospital Address</span>
                                            <p className="font-bold text-slate-700 flex items-start gap-2">
                                                <Edit3 className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                                                {doctorProfile?.address || "Address not specified"}
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Primary Email</span>
                                            <p className="font-bold text-slate-700">{userInfo.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-slate-100 pt-6">
                                <button onClick={() => setIsEditModalOpen(true)} className="px-8 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                                    <Settings className="w-5 h-5" /> Configure Profile Settings
                                </button>
                                <button onClick={handleDeleteAccount} className="px-8 py-3.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
                                    <ShieldAlert className="w-5 h-5" /> Delete Account
                                </button>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'patients' && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-500" /> Patient Database Explorer
                                </h2>
                            </div>
                            {uniquePatientsList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {uniquePatientsList.map(patient => (
                                        <div key={patient._id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col hover:shadow-md transition-shadow group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src={patient.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name || 'X')}&background=c084fc&color=fff`} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-white border border-slate-200" alt={patient.name} />
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{patient.name}</h4>
                                                    {(patient.age || patient.gender) && (
                                                        <div className="text-xs font-semibold text-slate-500 mt-0.5">
                                                            {patient.age ? `${patient.age} Yrs` : ''}{patient.age && patient.gender ? ' • ' : ''}{patient.gender}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100"><Mail className="w-3 h-3 text-blue-500" /></div>
                                                    <span className="truncate">{patient.email}</span>
                                                </div>
                                                {patient.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center border border-green-100"><Phone className="w-3 h-3 text-green-500" /></div>
                                                        <span>{patient.phone}</span>
                                                    </div>
                                                )}
                                                {patient.address && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100"><MapPin className="w-3 h-3 text-amber-500" /></div>
                                                        <span className="truncate">{patient.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Medical Notes / History</span>
                                                <p className="text-xs font-medium text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm line-clamp-3">
                                                    {patient.medicalNotes || "No specific medical history documented."}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-100 border-dashed">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Patients Yet</h3>
                                    <p className="text-slate-500">Your registered patients will appear here once you have appointments.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'careHistory' && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-indigo-500" /> Care Partner History
                                </h2>
                            </div>
                            {bookedAppointments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {bookedAppointments.map(apt => (
                                        <div key={apt._id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col hover:shadow-md transition-shadow group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src={apt.doctor?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.name || 'D')}&background=6366f1&color=fff`} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-white border border-slate-200" alt={apt.doctor?.name} />
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors">Dr. {apt.doctor?.name}</h4>
                                                    <p className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-md inline-block mt-1">{apt.doctor?.specialty}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-700">{new Date(apt.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-secondary-500" />
                                                    <span className="text-sm font-bold text-slate-800">{apt.timeSlot}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${apt.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                    apt.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        apt.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                            'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">Fee: ${apt.consultationFee}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-100 border-dashed">
                                    <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Care History</h3>
                                    <p className="text-slate-500">Appointments you book with other care partners will appear here.</p>
                                    <Link to="/doctors" className="mt-4 inline-flex items-center gap-2 text-primary-600 font-bold hover:underline">
                                        Book your first care partner <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
            {/* Editing Profile Modal (Preserved exactly but restyled tightly) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative z-10 p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-800">Profile Settings</h2>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 font-medium text-slate-700 outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Specialty Focus</label>
                                        <input type="text" value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 font-medium text-slate-700 outline-none transition-all" required />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Experience (Yrs)</label>
                                            <input type="number" value={editForm.experienceYears} onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 font-medium text-slate-700 outline-none transition-all" required />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Session Fee ($)</label>
                                            <input type="number" value={editForm.consultationFee} onChange={(e) => setEditForm({ ...editForm, consultationFee: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 font-medium text-slate-700 outline-none transition-all" required />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/3 flex flex-col items-center justify-start">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 w-full text-left">Display Avatar</label>
                                    <div className="w-32 h-32 rounded-[2rem] border-4 border-slate-100 overflow-hidden relative cursor-pointer shadow-md bg-white group flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
                                        {editPhoto ? (
                                            <img src={URL.createObjectURL(editPhoto)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : doctorProfile?.profilePhoto ? (
                                            <img src={doctorProfile.profilePhoto} alt="Current" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="w-8 h-8 text-slate-300" />
                                        )}
                                        <div className="absolute inset-0 bg-primary-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                            <span className="text-white text-xs font-bold bg-black/40 px-3 py-1.5 rounded-lg border border-white/20">Upload</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => setEditPhoto(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Clinic/Hospital Address</label>
                                <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 font-medium text-slate-700 outline-none transition-all mb-4" required placeholder="e.g. 123 Medical Park, Suite 4B" />
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Professional bio</label>
                                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows="4" className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 font-medium text-slate-700 flex-1 outline-none resize-none transition-all" placeholder="Introduce yourself into the clinical network..."></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors w-full sm:w-auto">Cancel</button>
                                <button type="submit" disabled={updatingProfile} className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                                    {updatingProfile ? 'Uploading...' : 'Deploy Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Prescription Modal (Preserved exactly but restyled tightly) */}
            {isPrescriptionModalOpen && prescriptionApt && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPrescriptionModalOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl relative z-10 p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-white">
                        <div className="flex items-center space-x-3 mb-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <div className="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">Rx</div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800">Issue e-Prescription</h2>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Patient: {prescriptionApt.patient?.name}</p>
                            </div>
                        </div>
                        <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                                    <span>Formulary Items</span>
                                    <button type="button" onClick={() => setPrescriptionForm({ ...prescriptionForm, medicines: [...prescriptionForm.medicines, { name: '', dosage: '', duration: '', notes: '' }] })} className="bg-white border border-slate-200 text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1">
                                        + Add Drug
                                    </button>
                                </h3>
                                <div className="space-y-3">
                                    {prescriptionForm.medicines.map((med, index) => (
                                        <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group overflow-hidden">
                                            {/* decorative line */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-200 group-hover:bg-indigo-400 transition-colors"></div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <div className="col-span-1 md:col-span-2">
                                                    <input type="text" value={med.name} onChange={(e) => { const updated = [...prescriptionForm.medicines]; updated[index].name = e.target.value; setPrescriptionForm({ ...prescriptionForm, medicines: updated }); }} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-bold outline-none placeholder-slate-400 text-slate-800 transition-all" required placeholder="Medicine Name (e.g. Lisinopril 10mg)" />
                                                </div>
                                                <div className="col-span-1">
                                                    <input type="text" value={med.dosage} onChange={(e) => { const updated = [...prescriptionForm.medicines]; updated[index].dosage = e.target.value; setPrescriptionForm({ ...prescriptionForm, medicines: updated }); }} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-bold outline-none placeholder-slate-400 text-slate-800 transition-all" required placeholder="Dose (1-0-1)" />
                                                </div>
                                                <div className="col-span-1">
                                                    <input type="text" value={med.duration} onChange={(e) => { const updated = [...prescriptionForm.medicines]; updated[index].duration = e.target.value; setPrescriptionForm({ ...prescriptionForm, medicines: updated }); }} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-bold outline-none placeholder-slate-400 text-slate-800 transition-all" required placeholder="Days/Weeks" />
                                                </div>
                                                <div className="col-span-1 md:col-span-4">
                                                    <input type="text" value={med.notes} onChange={(e) => { const updated = [...prescriptionForm.medicines]; updated[index].notes = e.target.value; setPrescriptionForm({ ...prescriptionForm, medicines: updated }); }} className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-xs font-medium outline-none placeholder-slate-400 text-slate-600 transition-all" placeholder="Add specific instructions (take with food, etc.)" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">General Medical Advice & Referrals</label>
                                <textarea value={prescriptionForm.generalInstructions} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, generalInstructions: e.target.value })} rows="4" className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 font-medium text-sm text-slate-700 outline-none resize-none transition-all placeholder-slate-400" placeholder="Lifestyle changes, next appointment recommendations..."></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsPrescriptionModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors w-full sm:w-auto">Cancel</button>
                                <button type="submit" disabled={submittingPrescription} className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2 justify-center">
                                    <ClipboardCheck className="w-5 h-5" />
                                    {submittingPrescription ? 'Signing...' : 'Sign & Complete Review'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Availability Manager Modal (Preserved exactly but restyled tightly) */}
            {isAvailabilityModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAvailabilityModalOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative z-10 p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-white">
                        <div className="flex items-center space-x-3 mb-6 bg-green-50 p-4 rounded-2xl border border-green-100">
                            <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md"><Clock className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800">Hours Engine</h2>
                                <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Configure Booking Pipeline</p>
                            </div>
                        </div>
                        <form onSubmit={handleAvailabilitySubmit} className="space-y-6">
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 hide-scrollbar">
                                {availabilityForm.map((dayObj, dayIndex) => (
                                    <div key={dayObj.day} className={`bg-white rounded-3xl border transition-all ${dayObj.slots.length > 0 ? 'border-green-200 shadow-md ring-1 ring-green-50' : 'border-slate-200 shadow-sm'} overflow-hidden`}>
                                        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b ${dayObj.slots.length > 0 ? 'bg-green-50/50' : 'bg-slate-50'}`}>
                                            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center font-bold shadow-sm ${dayObj.slots.length > 0 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {dayObj.day.substring(0, 3).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className={`font-black text-lg tracking-tight ${dayObj.slots.length > 0 ? 'text-green-800' : 'text-slate-600'}`}>{dayObj.day}</h3>
                                                    <p className={`text-xs font-bold uppercase tracking-widest ${dayObj.slots.length > 0 ? 'text-green-600/80' : 'text-slate-400'}`}>{dayObj.slots.length > 0 ? 'Accepting Appointments' : 'Offline'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-full sm:w-auto focus-within:ring-2 focus-within:ring-green-400 focus-within:border-green-400 transition-all">
                                                <div className="relative flex-1 sm:w-auto pl-2">
                                                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <input type="time" id={`time-${dayIndex}`} className="w-full sm:w-auto pl-7 pr-3 py-2 rounded-lg outline-none text-sm font-bold text-slate-700 cursor-pointer bg-transparent" />
                                                </div>
                                                <button type="button" onClick={() => {
                                                    const val = document.getElementById(`time-${dayIndex}`).value;
                                                    if (val) {
                                                        let [h, m] = val.split(':');
                                                        let ampm = h >= 12 ? 'PM' : 'AM';
                                                        let hr = h % 12 || 12;
                                                        let formatted = `${hr < 10 ? '0' + hr : hr}:${m} ${ampm}`;
                                                        handleSlotChange(dayIndex, formatted, 'add');
                                                        document.getElementById(`time-${dayIndex}`).value = '';
                                                    }
                                                }} className="bg-slate-900 mx-1 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-slate-900/10 transition-colors whitespace-nowrap">
                                                    Add Time
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white">
                                            {dayObj.slots.length === 0 ? (
                                                <div className="flex items-center justify-center gap-3 py-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                                    <span className="text-sm font-bold text-slate-400">Doctor marked as away for the day.</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-3">
                                                    {dayObj.slots.map((slot, sIdx) => (
                                                        <span key={sIdx} className="bg-white text-slate-700 px-4 py-2 rounded-xl border-2 border-slate-100 text-sm font-bold flex items-center shadow-sm group hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-all cursor-default">
                                                            <span className="text-green-500 mr-2 group-hover:text-red-500 transition-colors">•</span> {slot}
                                                            <button type="button" onClick={() => handleSlotChange(dayIndex, slot, 'remove')} className="ml-3 text-slate-400 hover:text-red-600 bg-slate-50 group-hover:bg-red-100 w-6 h-6 flex items-center justify-center rounded-full transition-colors focus:outline-none">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAvailabilityModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors w-full sm:w-auto">Cancel Workflow</button>
                                <button type="submit" disabled={updatingAvailability} className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                                    {updatingAvailability ? 'Pushing Updates...' : 'Publish Pipeline'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around items-center p-3 z-50 pb-safe">
                <button
                    onClick={() => { setActiveTab('overview'); window.scrollTo(0,0); }}
                    className={`flex flex-col items-center space-y-1 ${activeTab === 'overview' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Home</span>
                </button>
                <button
                    onClick={() => { setActiveTab('appointments'); window.scrollTo(0,0); }}
                    className={`flex flex-col items-center space-y-1 ${activeTab === 'appointments' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Schedule</span>
                </button>
                <button
                    onClick={() => { setIsAvailabilityModalOpen(true); window.scrollTo(0,0); }}
                    className={`flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-600`}
                >
                    <Clock className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Hours</span>
                </button>
                <button
                    onClick={() => { setActiveTab('profile'); window.scrollTo(0,0); }}
                    className={`flex flex-col items-center space-y-1 ${activeTab === 'profile' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Settings</span>
                </button>
            </div>
            {/* End of mobile bottom nav */}
        </div>
    );
};
export default DoctorDashboard;