import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, ChevronRight, ChevronLeft, Search, Calendar, CreditCard, User, Activity, CheckCircle, Shield, Layout, Star, MapPin } from 'lucide-react';
const PATIENT_STEPS = [
    {
        id: 1,
        title: 'Find Top Specialists',
        description: 'Advanced filters help patients find the right doctor instantly based on specialty, rating, and availability.',
        content: (
            <div className="flex flex-col h-full bg-slate-50 relative pointer-events-none">
                {/* Mock Search Bar */}
                <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-xl w-1/2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400 text-sm">Cardiologist</span>
                    </div>
                </div>
                {/* Mock Results */}
                <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                    {[1, 2].map((i) => (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                            key={i}
                            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden"
                        >
                            <div className="w-12 h-12 bg-primary-100 rounded-full mb-3 border-2 border-white shadow-sm absolute top-4 right-4 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary-500" />
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">Dr. Sarah Jenkins</h4>
                            <p className="text-xs text-primary-600 font-semibold mb-2">Cardiologist</p>
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-3">
                                <Star className="w-3 h-3 fill-amber-500" /> 4.9 (120 rev)
                            </div>
                            {i === 1 && (
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="mt-2 w-full bg-primary-600 text-white text-xs font-bold py-2 rounded-lg text-center shadow-lg shadow-primary-500/30"
                                >
                                    Book Appointment
                                </motion.div>
                            )}
                            {i === 2 && (
                                <div className="mt-2 w-full bg-slate-100 text-slate-400 text-xs font-bold py-2 rounded-lg text-center">
                                    Next Available: Tue
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
                {/* Pointer / Tooltip simulation */}
                <motion.div
                    initial={{ x: 100, y: 150, opacity: 0 }}
                    animate={{ x: 130, y: 150, opacity: 1 }}
                    transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                    className="absolute z-20 flex flex-col items-center"
                >
                    <div className="w-4 h-4 rounded-full bg-black/20 animate-ping absolute -top-1 -left-1"></div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="z-10 text-slate-800 drop-shadow-md transform -rotate-12">
                        <path d="M5 3L19 12L12 14L9 21L5 3Z" fill="currentColor" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                </motion.div>
            </div>
        )
    },
    {
        id: 2,
        title: 'Seamless Booking',
        description: 'Pick an open slot directly from the doctor\'s calendar. Synced in real-time, preventing double bookings.',
        content: (
            <div className="flex flex-col h-full bg-white relative p-6 pointer-events-none">
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Select Date & Time</h4>
                        <p className="text-xs text-slate-500">Dr. Sarah Jenkins - Consultation</p>
                    </div>
                </div>
                <div className="flex gap-2 mb-6">
                    {['Mon', 'Tue', 'Wed'].map((d, i) => (
                        <div key={d} className={`flex-1 py-3 text-center rounded-xl border ${i === 1 ? 'border-primary-600 bg-primary-600 text-white shadow-md' : 'border-slate-200 text-slate-600'}`}>
                            <p className="text-xs font-bold uppercase">{d}</p>
                            <p className={`text-sm font-black ${i === 1 ? 'text-white' : 'text-slate-800'}`}>{14 + i}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 border border-slate-200 py-2 rounded-lg text-center text-sm font-semibold text-slate-600">09:00 AM</div>
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.05, 1], backgroundColor: ['#f8fafc', '#f59e0b', '#f8fafc'], color: ['#475569', '#fff', '#475569'] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                        className="border border-amber-500 py-2 rounded-lg text-center text-sm font-bold text-amber-500 shadow-sm"
                    >
                        10:00 AM
                    </motion.div>
                    <div className="bg-slate-50 border border-slate-200 py-2 rounded-lg text-center text-sm font-semibold text-slate-600">01:00 PM</div>
                    <div className="bg-slate-50 border border-slate-200 py-2 rounded-lg text-center text-sm font-semibold text-slate-600">03:30 PM</div>
                </div>
                <div className="mt-auto bg-primary-50 border border-primary-100 rounded-xl p-4 flex justify-between items-center">
                    <div className="text-primary-800 font-bold">$150 Fee</div>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Request</button>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: 'Secure Payments',
        description: 'Complete payments instantly through the Stripe gateway to confirm your appointment.',
        content: (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 relative p-6 pointer-events-none">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 text-center"
                >
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Payment Successful!</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">Your appointment is confirmed for Tue 15, 10:00 AM.</p>

                    <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100 mb-4">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-600">•••• 4242</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">$150.00</span>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold">Go to Dashboard</button>
                </motion.div>
            </div>
        )
    }
];
const DOCTOR_STEPS = [
    {
        id: 1,
        title: 'Centralized Dashboard',
        description: 'Providers wake up to a clear summary of their day: action-needed requests and financial metrics.',
        content: (
            <div className="flex flex-col h-full bg-slate-50 pointer-events-none p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-lg font-black text-slate-800">Overview</h4>
                        <p className="text-xs text-slate-500">Welcome back, Dr. Jenkins</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200">S</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <Activity className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-xs font-bold text-slate-500">Pending</p>
                        <p className="text-xl font-black text-slate-800">3</p>
                    </div>
                    <div className="bg-primary-600 p-4 rounded-xl shadow-md text-white">
                        <CreditCard className="w-5 h-5 text-primary-200 mb-2" />
                        <p className="text-xs font-bold text-primary-100">Month Revenue</p>
                        <p className="text-xl font-black">$4,250</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 p-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Up Next Today</h4>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-10 bg-amber-400 rounded-full"></div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">Consultation - Alice J.</p>
                            <p className="text-xs text-slate-500">10:00 AM (pending)</p>
                        </div>
                        <div className="text-xs font-bold bg-amber-50 text-amber-500 px-2 py-1 rounded-md">Action Required</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: 'Approve & Earn',
        description: 'Quickly accept or reject patient requests. Once accepted, patients are prompted to pay.',
        content: (
            <div className="flex flex-col items-center justify-center h-full bg-slate-900 pointer-events-none p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 mix-blend-screen blur-2xl rounded-full"></div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-2xl relative z-10"
                >
                    <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Alice Johnson</p>
                                <p className="text-xs text-slate-400">Cardiology Checkup</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md">Pending</span>
                    </div>
                    <div className="flex gap-2 mb-4 text-xs font-medium text-slate-300">
                        <div className="bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2"><Calendar className="w-3 h-3" /> Tue 15, 10:00 AM</div>
                        <div className="bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-green-400"><CreditCard className="w-3 h-3" /> $150</div>
                    </div>
                    <div className="flex gap-3">
                        <motion.button
                            animate={{ scale: [1, 1.05, 1], backgroundColor: ['#10b981', '#059669', '#10b981'] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm font-bold shadow-lg shadow-emerald-500/20"
                        >
                            Accept
                        </motion.button>
                        <button className="flex-1 bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-xl py-2.5 text-sm font-bold">
                            Reject
                        </button>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ x: 100, y: 150, opacity: 0 }}
                    animate={{ x: 50, y: 120, opacity: 1 }}
                    transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                    className="absolute z-20 flex flex-col items-center"
                >
                    <div className="w-4 h-4 rounded-full bg-white/40 animate-ping absolute -top-1 -left-1"></div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="z-10 text-white drop-shadow-md transform -rotate-12">
                        <path d="M5 3L19 12L12 14L9 21L5 3Z" fill="currentColor" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                </motion.div>
            </div>
        )
    }
];
const DemoModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('patient');
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const stepsData = activeTab === 'patient' ? PATIENT_STEPS : DOCTOR_STEPS;
    // Auto-play effect
    useEffect(() => {
        let interval;
        if (isOpen && isPlaying) {
            interval = setInterval(() => {
                setCurrentStep((prev) => (prev + 1) % stepsData.length);
            }, 5000); // 5 seconds per step
        }
        return () => clearInterval(interval);
    }, [isOpen, isPlaying, activeTab, stepsData.length]);
    // Reset step when changing tabs
    useEffect(() => {
        setCurrentStep(0);
    }, [activeTab]);
    if (!isOpen) return null;
    const currentSlide = stepsData[currentStep];
    const nextStep = () => setCurrentStep((p) => (p + 1) % stepsData.length);
    const prevStep = () => setCurrentStep((p) => (p - 1 + stepsData.length) % stepsData.length);
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex justify-center items-center px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden relative z-10 border border-white/50 flex flex-col max-h-[90vh]"
                >
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 max-w-[400px]">
                            <button
                                onClick={() => setActiveTab('patient')}
                                className={`flex-1 py-1.5 px-4 text-sm font-bold rounded-lg transition-all ${activeTab === 'patient' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Patient Journey
                            </button>
                            <button
                                onClick={() => setActiveTab('doctor')}
                                className={`flex-1 py-1.5 px-4 text-sm font-bold rounded-lg transition-all ${activeTab === 'doctor' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Provider View
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Main UI */}
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[500px]">

                        {/* Left: Content & Controls */}
                        <div className="w-full md:w-5/12 p-6 md:p-10 flex flex-col bg-white overflow-y-auto">
                            <span className="text-primary-600 font-bold uppercase tracking-widest text-xs mb-2">Step {currentStep + 1} of {stepsData.length}</span>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="mb-8"
                                >
                                    <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight leading-tight">{currentSlide.title}</h2>
                                    <p className="text-slate-500 text-lg leading-relaxed font-medium">{currentSlide.description}</p>
                                </motion.div>
                            </AnimatePresence>
                            <div className="mt-auto pt-6 border-t border-slate-100 w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="text-primary-600 flex items-center gap-1 text-xs font-bold hover:bg-primary-50 px-2 py-1 rounded-md transition-colors"
                                    >
                                        {isPlaying ? <><Pause className="w-3 h-3" /> Pause Demo</> : <><Play className="w-3 h-3" /> Resume Auto-play</>}
                                    </button>
                                </div>

                                <div className="flex items-center gap-1 mb-6">
                                    {stepsData.map((_, idx) => (
                                        <div key={idx} className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden relative">
                                            {idx < currentStep && <div className="absolute inset-0 bg-primary-500"></div>}
                                            {idx === currentStep && (
                                                <motion.div
                                                    initial={{ width: isPlaying ? '0%' : '100%' }}
                                                    animate={{ width: isPlaying ? '100%' : '100%' }}
                                                    transition={{ duration: isPlaying ? 5 : 0, ease: 'linear' }}
                                                    className="absolute inset-y-0 left-0 bg-primary-500"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={prevStep} className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={nextStep} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-200/50">
                                        <span>{currentStep === stepsData.length - 1 ? 'Restart Journey' : 'Next Step'}</span>
                                        {currentStep !== stepsData.length - 1 && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Right: Browser Frame (The Simulation) */}
                        <div className="w-full md:w-7/12 bg-slate-50 p-6 md:p-8 flex items-center justify-center">
                            <div className="w-full h-full max-h-[500px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex flex-col relative transform md:rotate-1 md:hover:rotate-0 transition-transform duration-500">
                                {/* Browser Header */}
                                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                                    </div>
                                    <div className="mx-auto bg-white/60 px-24 py-1.5 rounded-md text-[10px] font-medium text-slate-400 flex items-center gap-2 border border-slate-200/50">
                                        <Shield className="w-3 h-3 text-emerald-500" />
                                        appointy.com/demo
                                    </div>
                                </div>

                                {/* Screen Content */}
                                <div className="flex-1 overflow-hidden relative bg-slate-50">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentSlide.id}
                                            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                                            transition={{ duration: 0.4 }}
                                            className="absolute inset-0"
                                        >
                                            {currentSlide.content}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
export default DemoModal;