import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, BadgeCheck, Clock, FileText, X, Calendar, CalendarDays, ChevronRight, Filter, Mail, Phone, Heart, RotateCcw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
const SPECIALTIES = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic'];
const SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM'];
const DoctorSearch = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [availableToday, setAvailableToday] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [maxPrice, setMaxPrice] = useState(600);
    const [minRating, setMinRating] = useState(0);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    // Modal state
    const [bookingDoctor, setBookingDoctor] = useState(null);
    const [viewProfileDoctor, setViewProfileDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    // Generate rolling 7-day view
    const getUpcomingDays = () => {
        const days = [];
        for (let i = 0; i <= 6; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                fullDate: date.toISOString().split('T')[0],
                displayDay: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
                displayDate: date.getDate(),
                displayMonth: date.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return days;
    };
    const upcomingDays = getUpcomingDays();
    const resetAllFilters = () => {
        setSearchTerm('');
        setSelectedSpecialty('All');
        setAvailableToday(false);
        setFilterDate('');
        setMaxPrice(2000);
        setMinRating(0);
    };
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/doctors');
                // Map the DB schema to match the UI component's expected fields
                const formattedDoctors = data.map(doc => {
                    const profilePhoto = (!doc.profilePhoto || doc.profilePhoto === 'null' || doc.profilePhoto === 'undefined')
                        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=c084fc&color=fff&size=256`
                        : doc.profilePhoto;
                    // Logic to check if the doctor is available today based on their schedule
                    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isAvailableCurrently = doc.availability?.some(a => a.day === currentDay && a.slots?.length > 0) || false;
                    return {
                        id: doc._id,
                        name: doc.name,
                        specialty: doc.specialty || 'General Practitioner',
                        experience: `${doc.experienceYears || 0} Years`,
                        location: doc.address || 'Medical Center',
                        rating: doc.averageRating || 0,
                        reviews: doc.totalReviews || 0,
                        fee: doc.consultationFee || 100,
                        isAvailable: isAvailableCurrently,
                        availability: doc.availability, // Store RAW availability for date picker filtering
                        image: profilePhoto,
                        email: doc.email,
                        phone: doc.phone
                    };
                });
                setDoctors(formattedDoctors);
            } catch (error) {
                console.error("Error fetching doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }
    const filteredDoctors = doctors.filter(doc => {
        if (doc.id === userInfo._id) return false;
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
        // --- Enhanced Availability Filtering ---
        let matchesAvailability = true;
        if (availableToday) {
            matchesAvailability = doc.isAvailable;
        } else if (filterDate) {
            // Get day of week for selected filterDate (e.g., 'Monday')
            // Using a specific split/join to maintain local date correctly from input string
            const [year, month, day] = filterDate.split('-');
            const dateObj = new Date(year, month - 1, day);
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            matchesAvailability = doc.availability?.some(a => a.day === dayOfWeek && a.slots?.length > 0);
        }
        const matchesPrice = doc.fee <= maxPrice;
        const matchesRating = doc.rating >= minRating;
        return matchesSearch && matchesSpecialty && matchesAvailability && matchesPrice && matchesRating;
    });
    const openViewProfileModal = async (doctor) => {
        setViewProfileDoctor({ ...doctor, allReviews: [], reviewSort: 'Latest' });
        try {
            const { data } = await axios.get(`http://localhost:5000/api/doctors/${doctor.id}/reviews`);
            setViewProfileDoctor(prev => prev ? { ...prev, allReviews: data } : null);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };
    const toggleLike = async (reviewId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(`http://localhost:5000/api/doctors/reviews/${reviewId}/like`, {}, config);
            setViewProfileDoctor(prev => {
                if (!prev) return prev;
                const updatedReviews = prev.allReviews.map(r =>
                    r._id === reviewId ? { ...r, likes: data } : r
                );
                return { ...prev, allReviews: updatedReviews };
            });
        } catch (error) {
            toast.error("Failed to update like status");
        }
    };
    const openBookingModal = (doctor) => {
        setBookingDoctor(doctor);
        setSelectedDate('');
        setSelectedSlot('');
    };
    const closeBookingModal = () => {
        setBookingDoctor(null);
    };
    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedSlot) {
            toast.error('Please select both a date and a time slot.');
            return;
        }
        try {
            setBookingLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const bookingData = {
                doctorId: bookingDoctor.id,
                date: new Date(selectedDate),
                timeSlot: selectedSlot
            };
            await axios.post('http://localhost:5000/api/appointments/book', bookingData, config);
            closeBookingModal();
            toast.success('Appointment request sent! You will be able to pay once the doctor accepts your request.');
            if (userInfo?.role === 'doctor') {
                navigate('/doctor/dashboard');
            } else {
                navigate('/patient/dashboard');
            }
        } catch (error) {
            console.error('Booking failed:', error);
            toast.error(error.response?.data?.message || 'Failed to book appointment. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };
    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12 font-sans text-slate-900 dark:text-slate-100 relative transition-colors duration-300">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200 dark:bg-primary-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
                {/* --- Sidebar Filters --- */}
                <aside className="w-full lg:w-1/3 xl:w-1/4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-4 sticky top-28">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <Filter className="w-5 h-5 text-primary-500" />
                                Filters
                            </h2>
                            <button onClick={resetAllFilters} className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-600 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 transition-all" title="Reset all filters">
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset
                            </button>
                        </div>
                        {/* Specialization */}
                        <div className="mb-4">
                            <h3 className="font-bold text-slate-500 mb-2 text-sm uppercase tracking-widest">Specialization</h3>
                            <div className="space-y-0.5">
                                {SPECIALTIES.map(spec => (
                                    <label key={spec} className={`flex items-center space-x-2.5 cursor-pointer group p-2 rounded-xl transition-all ${selectedSpecialty === spec ? 'bg-primary-50 border border-primary-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}>
                                        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${selectedSpecialty === spec ? 'border-primary-600 bg-primary-600' : 'border-slate-300 group-hover:border-primary-400'}`}>
                                            {selectedSpecialty === spec && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                                        </div>
                                        <span className={`text-l tracking-wide ${selectedSpecialty === spec ? 'text-primary-700 font-extrabold' : 'text-slate-700 font-semibold group-hover:text-slate-900'}`}>{spec}</span>
                                        <input type="radio" name="specialty" className="hidden" checked={selectedSpecialty === spec} onChange={() => setSelectedSpecialty(spec)} />
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Availability (Toggle + Date Picker) */}
                        <div className="mb-5 pb-5 border-b border-slate-100">
                            <h3 className="font-bold text-slate-500 mb-3 text-xs uppercase tracking-widest">Availability</h3>
                            {/* Toggle: Available Today */}
                            <label className={`flex items-center justify-between cursor-pointer group p-2.5 mb-3 rounded-xl transition-all ${availableToday ? 'bg-green-50 border border-green-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}>
                                <span className={`font-bold text-base tracking-wide transition-colors ${availableToday ? 'text-green-700' : 'text-slate-700 group-hover:text-primary-600'}`}>Available Today</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={availableToday}
                                        onChange={(e) => {
                                            setAvailableToday(e.target.checked);
                                            if (e.target.checked) setFilterDate(''); // Clear specific date if "Today" is checked
                                        }}
                                    />
                                    <div className={`block w-12 h-6 rounded-full transition-colors ${availableToday ? 'bg-green-500 shadow-inner' : 'bg-slate-200'}`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${availableToday ? 'transform translate-x-6' : ''}`}></div>
                                </div>
                            </label>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>
                            {/* Date Picker */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Calendar className={`w-5 h-5 transition-colors ${filterDate ? 'text-primary-500' : 'text-slate-400 group-hover:text-primary-400'}`} />
                                </div>
                                <input
                                    type="date"
                                    value={filterDate}
                                    min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
                                    onChange={(e) => {
                                        setFilterDate(e.target.value);
                                        if (e.target.value) setAvailableToday(false); // Uncheck "Today" if a specific date is picked
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all outline-none cursor-pointer font-bold text-sm ${filterDate ? 'bg-primary-50 border-primary-400 text-primary-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-white'}`}
                                />
                            </div>
                        </div>
                        {/* Price Range */}
                        <div className="mb-4 pb-4 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-slate-500 text-sm uppercase tracking-widest">Max Fee</h3>
                                <div className="bg-primary-50 text-primary-700 font-black px-2 py-0.5 rounded-lg text-sm border border-primary-100 shadow-sm">${maxPrice}</div>
                            </div>
                            <input type="range" min="100" max="2000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                            <div className="flex justify-between text-sm font-bold text-slate-400 mt-2">
                                <span>$100</span>
                                <span>$2000</span>
                            </div>
                        </div>
                        {/* Rating */}
                        <div className="mb-4 pb-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-500 mb-3 text-sm uppercase tracking-widest">Minimum Rating</h3>
                            <button onClick={() => setMinRating(minRating === 4 ? 0 : 4)} className={`w-full py-2 px-3 rounded-xl border-2 flex justify-center items-center space-x-2 transition-all shadow-sm ${minRating === 4 ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <Star className={`w-4 h-4 ${minRating === 4 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                                <span className="font-extrabold tracking-wide text-sm">4.0+ Stars</span>
                            </button>
                        </div>
                        {/* Reset All */}
                        <button onClick={resetAllFilters} className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 font-extrabold text-sm transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Reset All Filters
                        </button>
                    </div>
                </aside>
                {/* --- Main Content (Feed) --- */}
                <main className="w-full lg:w-3/4">
                    {/* Search Bar */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-2.5 mb-8 flex items-center focus-within:ring-4 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/30 focus-within:border-primary-400 dark:focus-within:border-primary-600 transition-all">
                        <div className="pl-5 pr-3 text-primary-500">
                            <Search className="w-6 h-6" />
                        </div>
                        <input type="text" placeholder="Search by name or condition..." className="flex-grow py-3 px-2 bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-10 py-4 rounded-full font-bold transition-all shadow-md shadow-primary-500/30">
                            Search
                        </button>
                    </div>
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            {loading ? 'Finding Care Partners...' : `${filteredDoctors.length} ${filteredDoctors.length === 1 ? 'Care Partner' : 'Care Partners'} Available`}
                        </h2>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredDoctors.map((doc, idx) => {
                                const isAvailableToDisplay = (() => {
                                    if (filterDate) {
                                        const [year, month, day] = filterDate.split('-');
                                        const dateObj = new Date(year, month - 1, day);
                                        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                                        return doc.availability?.some(a => a.day === dayOfWeek && a.slots?.length > 0) || false;
                                    }
                                    return doc.isAvailable;
                                })();
                                return (
                                    <motion.div key={doc.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-800 transition-all flex flex-col md:flex-row gap-6 group">
                                        {/* Avatar & Status */}
                                        <div className="flex-shrink-0 flex flex-col items-center">
                                            <div className="relative w-32 h-32 transform group-hover:scale-105 transition-transform">
                                                <img src={doc.image} alt={doc.name} className="w-full h-full rounded-[2rem] object-cover border-[6px] border-slate-50 shadow-md" />
                                                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-[3px] border-white flex items-center justify-center ${isAvailableToDisplay ? 'bg-green-500' : 'bg-slate-400'}`} title={isAvailableToDisplay ? 'Available' : 'Away'}>
                                                    {isAvailableToDisplay && <BadgeCheck className="w-4 h-4 text-white" />}
                                                </div>
                                            </div>
                                            <span className={`mt-4 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg border flex items-center gap-1 ${isAvailableToDisplay ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                <div className={`w-2 h-2 rounded-full ${isAvailableToDisplay ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                                {isAvailableToDisplay ? 'Available' : 'Away'}
                                            </span>
                                        </div>
                                        {/* Info */}
                                        <div className="flex-grow">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{doc.name}</h3>
                                                        <BadgeCheck className="text-primary-500 w-6 h-6" />
                                                    </div>
                                                    <p className="text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-md inline-block">{doc.specialty}</p>
                                                </div>
                                                <div className="mt-3 md:mt-0 flex flex-col items-end">
                                                    <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
                                                        <Star className="fill-amber-400 text-amber-400 w-5 h-5 mr-1.5" />
                                                        <span className="font-extrabold text-amber-700 text-lg">{doc.rating}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-400 mt-1">{doc.reviews} Reviews</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button onClick={() => openBookingModal(doc)} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Book Appointment</span>
                                                </button>
                                                <button onClick={() => openViewProfileModal(doc)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center">
                                                    View Partner Profile
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                    {!loading && filteredDoctors.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 transform rotate-6">
                                <Search className="text-slate-300 w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">No Care Partners Found</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                            <button onClick={() => { setSearchTerm(''); setSelectedSpecialty('All'); setAvailableToday(false); setMaxPrice(300); setMinRating(0); }} className="mt-8 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-full font-bold transition-colors">
                                Reset All Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
            {/* --- Booking Modal --- */}
            <AnimatePresence>
                {bookingDoctor && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeBookingModal} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-white">
                            <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white">
                                <div className="flex gap-4 items-center">
                                    <img src={bookingDoctor.image} alt={bookingDoctor.name} className="w-16 h-16 rounded-[1.2rem] object-cover border-4 border-white shadow-sm" />
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">Book Session</h2>
                                        <p className="text-sm text-primary-600 font-bold bg-primary-100/50 px-2 py-0.5 rounded-md inline-block">{bookingDoctor.name}</p>
                                    </div>
                                </div>
                                <button onClick={closeBookingModal} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-white shadow-sm border border-slate-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8">
                                <h3 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary-500" /> Select Date
                                </h3>
                                <div className="flex space-x-3 overflow-x-auto pb-4 hide-scrollbar">
                                    {upcomingDays.map((day) => {
                                        const [y, m, d] = day.fullDate.split('-');
                                        const dowFull = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
                                        const hasSlots = bookingDoctor?.availability?.some(a => a.day === dowFull && a.slots?.length > 0);

                                        return (
                                            <button
                                                key={day.fullDate}
                                                disabled={!hasSlots}
                                                onClick={() => { setSelectedDate(day.fullDate); setSelectedSlot(''); setShowCustomDatePicker(false); }}
                                                className={`flex-shrink-0 flex flex-col items-center min-w-[72px] px-4 py-3 rounded-2xl border-2 text-sm font-extrabold transition-all transform hover:-translate-y-0.5 ${!hasSlots ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' : selectedDate === day.fullDate ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white border-slate-100 text-slate-600 hover:border-primary-200'}`}
                                                title={!hasSlots ? "Doctor not available" : ""}
                                            >
                                                <span className={`text-[10px] font-bold uppercase ${selectedDate === day.fullDate ? 'text-primary-200' : 'text-slate-400'}`}>{day.displayDay}</span>
                                                <span className="text-lg font-black my-0.5">{day.displayDate}</span>
                                                <span className={`text-[10px] ${selectedDate === day.fullDate ? 'text-primary-200' : 'text-slate-400'}`}>{day.displayMonth}</span>
                                            </button>
                                        );
                                    })}
                                    {/* Choose a Date button */}
                                    <button
                                        onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                                        className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[72px] px-4 py-3 rounded-2xl border-2 border-dashed transition-all transform hover:-translate-y-0.5 ${showCustomDatePicker ? 'border-primary-400 bg-primary-50 text-primary-600' : 'border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-500'}`}
                                    >
                                        <CalendarDays className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-bold">Pick</span>
                                    </button>
                                </div>
                                {showCustomDatePicker && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Choose a specific date:</label>
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={selectedDate}
                                            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); setShowCustomDatePicker(false); }}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none cursor-pointer"
                                        />
                                    </div>
                                )}
                                <motion.div animate={{ opacity: selectedDate ? 1 : 0.4 }} className="mt-6">
                                    <h3 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary-500" /> Select Time
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(() => {
                                            if (!selectedDate) {
                                                return <div className="col-span-3 text-sm font-bold text-slate-400 bg-slate-50 p-3 rounded-xl text-center border border-dashed border-slate-200">Please select a date first</div>;
                                            }
                                            const [y, m, d] = selectedDate.split('-');
                                            const activeDow = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
                                            const dynamicSlots = bookingDoctor?.availability?.find(a => a.day === activeDow)?.slots || [];

                                            if (dynamicSlots.length === 0) {
                                                return <div className="col-span-3 text-sm font-bold text-red-400 bg-red-50 p-3 rounded-xl text-center border border-dashed border-red-200">No time slots available for this date</div>;
                                            }
                                            return dynamicSlots.map(slot => (
                                                <button key={slot} disabled={!selectedDate} onClick={() => setSelectedSlot(slot)} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${selectedSlot === slot ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-inner' : 'bg-white border-slate-100 text-slate-600 hover:border-primary-200'}`}>
                                                    {slot}
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="p-8 pt-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="w-full sm:w-auto text-center sm:text-left bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fee</p>
                                    <p className="text-3xl font-extrabold text-slate-800">${bookingDoctor.fee}</p>
                                </div>
                                <button onClick={handleConfirmBooking} disabled={!selectedDate || !selectedSlot || bookingLoading} className={`w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${(!selectedDate || !selectedSlot || bookingLoading) ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 transform hover:-translate-y-0.5'}`}>
                                    <span>{bookingLoading ? 'Processing Request...' : 'Proceed to Checkout'}</span>
                                    {!bookingLoading && <ChevronRight className="w-5 h-5 ml-2" />}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* --- View Profile Modal --- */}
            <AnimatePresence>
                {viewProfileDoctor && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewProfileDoctor(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 border border-white">
                            <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white relative">
                                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start w-full">
                                    <img src={viewProfileDoctor.image} alt={viewProfileDoctor.name} className="w-32 h-32 rounded-[1.5rem] object-cover border-4 border-white shadow-md relative z-10" />
                                    <div className="flex-1 text-center md:text-left pt-2">
                                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-2">
                                            <div>
                                                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-2">
                                                    {viewProfileDoctor.name}
                                                    <BadgeCheck className="text-primary-500 w-6 h-6" />
                                                </h2>
                                                <p className="text-sm text-primary-600 font-bold bg-primary-100/50 px-3 py-1 rounded-lg inline-block mt-2">{viewProfileDoctor.specialty}</p>
                                            </div>
                                            <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end bg-amber-50 p-3 rounded-2xl border border-amber-100 shadow-sm">
                                                <div className="flex items-center gap-1">
                                                    <Star className="fill-amber-400 text-amber-400 w-6 h-6" />
                                                    <span className="font-black text-amber-700 text-xl">{viewProfileDoctor.rating}</span>
                                                </div>
                                                <span className="text-xs font-bold text-amber-600 mt-1">{viewProfileDoctor.reviews} Reviews</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setViewProfileDoctor(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-white shadow-sm border border-slate-100 z-20">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8 bg-slate-50 border-b border-slate-100 max-h-[40vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 transition-colors">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 shadow-inner text-secondary-500"><Clock className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Experience</p>
                                            <p className="font-bold text-slate-700">{viewProfileDoctor.experience}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 transition-colors">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 shadow-inner text-blue-500"><MapPin className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Clinic Location</p>
                                            <p className="font-bold text-slate-700 text-sm line-clamp-2">{viewProfileDoctor.location}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 transition-colors">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 shadow-inner text-indigo-500"><Mail className="w-5 h-5" /></div>
                                        <div className="overflow-hidden min-w-0 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
                                            <p className="font-bold text-slate-700 text-sm truncate" title={viewProfileDoctor.email}>{viewProfileDoctor.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 transition-colors">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 shadow-inner text-emerald-500"><Phone className="w-5 h-5" /></div>
                                        <div className="overflow-hidden min-w-0 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Contact Number</p>
                                            <p className="font-bold text-slate-700 text-sm truncate" title={viewProfileDoctor.phone || 'Not available'}>{viewProfileDoctor.phone || 'Not available'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-primary-100 shadow-sm mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary-50 rounded-[1.2rem] flex items-center justify-center border border-primary-100 shadow-inner">
                                            <FileText className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-primary-600 uppercase tracking-widest leading-tight">Consultation<br />Fee</p>
                                        </div>
                                    </div>
                                    <p className="text-4xl font-black text-primary-700">${viewProfileDoctor.fee}</p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Patient Reviews
                                        </h3>
                                        <select
                                            className="text-xs font-bold bg-slate-100 border-none outline-none text-slate-600 rounded-lg px-2 py-1 cursor-pointer focus:ring-2 focus:ring-primary-100"
                                            value={viewProfileDoctor.reviewSort || 'Latest'}
                                            onChange={(e) => setViewProfileDoctor({ ...viewProfileDoctor, reviewSort: e.target.value })}
                                        >
                                            <option value="Latest">Latest</option>
                                            <option value="Top Rated">Top Rated</option>
                                            <option value="Most Liked">Most Liked</option>
                                        </select>
                                    </div>
                                    {viewProfileDoctor.allReviews && viewProfileDoctor.allReviews.length > 0 ? (
                                        <div className="space-y-3">
                                            {(() => {
                                                const sortType = viewProfileDoctor.reviewSort || 'Latest';
                                                let sorted = [...viewProfileDoctor.allReviews];
                                                if (sortType === 'Top Rated') sorted.sort((a, b) => b.rating - a.rating);
                                                else if (sortType === 'Most Liked') sorted.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
                                                else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                                                return sorted.slice(0, 5).map((rev, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col transition-all hover:border-primary-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-1">
                                                                {Array.from({ length: rev.rating }).map((_, idx) => <Star key={`fill-${idx}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                                                                {Array.from({ length: 5 - rev.rating }).map((_, idx) => <Star key={`emp-${idx}`} className="w-3.5 h-3.5 text-slate-200" />)}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-600 italic mb-3 flex-grow">"{rev.comment}"</p>
                                                        <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-auto">
                                                            <span className="text-xs font-bold text-slate-400">
                                                                {rev.patient?.name || 'Patient'}
                                                            </span>
                                                            <button onClick={() => toggleLike(rev._id)} className="flex items-center gap-1.5 focus:outline-none group">
                                                                <Heart className={`w-4 h-4 transition-transform group-active:scale-95 ${rev.likes?.includes(userInfo._id) ? 'fill-red-500 text-red-500' : 'text-slate-300 group-hover:text-red-400'}`} />
                                                                <span className={`text-[11px] font-extrabold ${rev.likes?.includes(userInfo._id) ? 'text-red-500' : 'text-slate-400'}`}>{rev.likes?.length || 0}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="bg-white p-6 rounded-xl border border-slate-100 text-center shadow-sm">
                                            <p className="text-sm font-bold text-slate-400">No reviews yet for this Care Partner.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-8 pt-0 flex justify-end gap-4">
                                <button onClick={() => { setBookingDoctor(viewProfileDoctor); setViewProfileDoctor(null); }} className="w-full px-8 py-3.5 rounded-xl font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-all flex items-center justify-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Book Appointment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default DoctorSearch;