import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaUserMd } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import SuccessCelebration from '../components/SuccessCelebration';

const AppointmentBooking = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    const [doctor, setDoctor] = useState(null);
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [isBookingDetailsVisible, setBookingDetailsVisible] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showBookingSuccess, setShowBookingSuccess] = useState(false);

    // Fetch real doctor data from API using the doctorId from the URL
    useEffect(() => {
        if (!doctorId) return;
        setLoadingDoctor(true);
        api.get(`/api/doctors/${doctorId}`)
            .then(res => setDoctor(res.data))
            .catch(err => {
                console.error('Failed to load doctor:', err);
                setDoctor(null);
            })
            .finally(() => setLoadingDoctor(false));
    }, [doctorId]);

    // Generate upcoming 7 days, filtering by doctor's specific availability days
    const getUpcomingDays = () => {
        if (!doctor || !doctor.availability) return [];
        const days = [];
        const availableDayNames = doctor.availability.map(a => a.day);

        // Get tomorrow as start date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            
            if (availableDayNames.includes(dayName)) {
                days.push({
                    fullDate: date.toISOString().split('T')[0],
                    displayDay: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    displayDate: date.getDate(),
                    displayMonth: date.toLocaleDateString('en-US', { month: 'short' }),
                    dayName: dayName
                });
            }
        }
        return days;
    };
    const upcomingDays = getUpcomingDays();

    // Get specific slots for the selected date
    const getAvailableSlots = () => {
        if (!selectedDate || !doctor) return [];
        const selectedDayDate = new Date(selectedDate);
        const dayName = selectedDayDate.toLocaleDateString('en-US', { weekday: 'long' });
        const dayConfig = doctor.availability.find(a => a.day === dayName);
        return dayConfig ? dayConfig.slots : [];
    };
    const currentAvailableSlots = getAvailableSlots();

    const handleSlotSelection = (slot) => {
        setSelectedSlot(slot);
        setBookingDetailsVisible(true);
    };

    const handleBookAppointment = async () => {
        if (!userInfo) return;
        setBookingLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const appointmentData = {
                doctorId: doctor._id,
                date: selectedDate,
                timeSlot: selectedSlot,
                consultationFee: doctor.consultationFee
            };
            await api.post('/api/appointments/book', appointmentData, config);
            setShowBookingSuccess(true);
        } catch (error) {
            console.error('Booking error:', error);
            const message = error.response?.data?.message || 'Failed to book appointment.';
            toast.error(message);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loadingDoctor) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <p className="text-xl font-semibold text-slate-600">Doctor profile not found.</p>
                <button onClick={() => navigate('/doctors')} className="mt-4 text-primary-600 font-bold hover:underline">← Browse Doctors</button>
            </div>
        );
    }

    return (
        <>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-8"
        >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="p-8 md:flex md:items-center md:justify-between border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center space-x-6">
                        <img
                            src={doctor.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=c084fc&color=fff&size=100`}
                            alt={doctor.name}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{doctor.name}</h1>
                            <div className="flex items-center text-primary-600 font-medium mt-1">
                                <FaUserMd className="mr-2" />
                                {doctor.specialty}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0 text-left md:text-right">
                        <div className="text-slate-500 text-sm">Consultation Fee</div>
                        <div className="text-3xl font-bold text-slate-800">₹{doctor.consultationFee}</div>
                    </div>
                </div>
                <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <FaCalendarAlt className="mr-3 text-primary-500" />
                        Select Date
                    </h2>

                    <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                        {upcomingDays.map((day) => (
                            <button
                                key={day.fullDate}
                                onClick={() => {
                                    setSelectedDate(day.fullDate);
                                    setSelectedSlot('');
                                    setBookingDetailsVisible(false);
                                }}
                                className={`flex flex-col items-center justify-center min-w-[80px] p-4 rounded-2xl transition-all border ${selectedDate === day.fullDate
                                        ? 'bg-primary-600 border-primary-600 text-white shadow-md transform scale-105'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-primary-50'
                                    }`}
                            >
                                <span className={`text-sm font-medium ${selectedDate === day.fullDate ? 'text-primary-100' : 'text-slate-400'}`}>
                                    {day.displayDay}
                                </span>
                                <span className="text-2xl font-bold my-1">{day.displayDate}</span>
                                <span className={`text-xs ${selectedDate === day.fullDate ? 'text-primary-100' : 'text-slate-500'}`}>
                                    {day.displayMonth}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-8 pt-0 border-t border-slate-100 mt-8"
                    >
                        <h2 className="text-xl font-bold text-slate-800 mb-6 mt-8 flex items-center">
                            <FaClock className="mr-3 text-amber-500" />
                            Available Time Slots
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {currentAvailableSlots.length > 0 ? (
                                currentAvailableSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => handleSlotSelection(slot)}
                                        className={`py-3 px-4 rounded-xl text-center font-medium transition-all ${selectedSlot === slot
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-slate-500 py-4 italic">No slots configured for this day.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
            {isBookingDetailsVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary-50 border border-primary-100 rounded-3xl p-8 shadow-sm"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
                                <FaCheckCircle className="text-green-500 mr-3" />
                                Booking Summary
                            </h3>
                            <p className="text-slate-600 text-lg mb-1">
                                Appointment with <span className="font-bold text-slate-800">{doctor.name}</span>
                            </p>
                            <p className="text-slate-600">
                                Date: <span className="font-bold text-slate-800">{selectedDate}</span> at <span className="font-bold text-slate-800">{selectedSlot}</span>
                            </p>
                        </div>

                        {userInfo ? (
                            <div className="flex flex-col items-center gap-3 ml-6 flex-shrink-0">
                                <p className="text-sm text-slate-500 font-medium text-center max-w-[180px] leading-relaxed italic">
                                    Ready to confirm?
                                </p>
                                <button
                                    onClick={handleBookAppointment}
                                    disabled={bookingLoading}
                                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 whitespace-nowrap min-w-[200px]"
                                >
                                    {bookingLoading ? 'Processing...' : 'Request Appointment →'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 ml-6 flex-shrink-0">
                                <p className="text-sm text-slate-500 font-medium text-center max-w-[180px] leading-relaxed">
                                    🔐 Create an account before making an appointment.
                                </p>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 whitespace-nowrap"
                                >
                                    Sign Up →
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
            <SuccessCelebration
                show={showBookingSuccess}
                onClose={() => {
                    setShowBookingSuccess(false);
                    navigate(userInfo?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
                }}
                title="Appointment Booked!"
                message="Your request has been sent. You'll be notified once the doctor confirms."
                buttonText="Go to Dashboard"
                variant="booking"
            />
        </>
    );
};

export default AppointmentBooking;