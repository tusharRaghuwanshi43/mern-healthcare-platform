import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowRight, HeartPulse, Sparkles, Activity, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import auraAvatar from '../assets/aura_avatar.png';

// ─── Greeting detection ────────────────────────────────────────────────────────
const GREETING_PATTERNS = /^(hi|hii|hello|hey|good morning|good afternoon|good evening|how are you|howdy|greetings|what's up|whats up|sup|yo)\b/i;
const SYMPTOM_KEYWORDS = /symptom|pain|fever|ache|cough|cold|headache|migraine|dizziness|nausea|vomit|rash|swelling|fatigue|tired|breath|chest|throat|hurt|ill|sick|infection|allergy|diabetes|pressure|dizzy|bleed|injury|burning|itching|sore|stomach|joint|back|skin|kidney|liver|heart|lung/i;

// ─── Upcoming days filtered by doctor availability ─────────────────────────────
const getFilteredDays = (availability = []) => {
    if (!availability.length) return [];
    const availableDayNames = availability.map(a => a.day);
    const days = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (availableDayNames.includes(dayName)) {
            days.push({
                fullDate: date.toISOString().split('T')[0],
                displayDay: date.toLocaleDateString('en-US', { weekday: 'short' }),
                displayDate: date.getDate(),
                displayMonth: date.toLocaleDateString('en-US', { month: 'short' }),
                dayName
            });
        }
        if (days.length >= 5) break;
    }
    return days;
};

// ─── In-chat booking widget ───────────────────────────────────────────────────
const BookingWidget = ({ doctor, userInfo, onBooked }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const days = getFilteredDays(doctor.availability || []);
    const getSlots = () => {
        if (!selectedDate) return [];
        const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
        const config = (doctor.availability || []).find(a => a.day === dayName);
        return config ? config.slots : [];
    };
    const currentSlots = getSlots();

    const handleBook = async () => {
        if (!selectedDate || !selectedSlot) return;
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('http://localhost:5000/api/appointments/book', {
                doctorId: doctor._id,
                date: selectedDate,
                timeSlot: selectedSlot,
                consultationFee: doctor.consultationFee
            }, config);
            toast.success('Appointment request sent! Awaiting doctor approval.');
            onBooked();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-md"
        >
            {/* Doctor header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white">
                <img
                    src={doctor.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=c084fc&color=fff&size=50`}
                    alt={doctor.name}
                    className="w-11 h-11 rounded-xl object-cover border-2 border-white/20 flex-shrink-0"
                />
                <div>
                    <p className="font-extrabold text-sm leading-tight">Book Session</p>
                    <p className="text-xs text-fuchsia-300 font-semibold">{doctor.name}</p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Date picker */}
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Select Date
                    </p>
                    {days.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No available dates configured.</p>
                    ) : (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {days.map(day => (
                                <button
                                    key={day.fullDate}
                                    onClick={() => { setSelectedDate(day.fullDate); setSelectedSlot(''); }}
                                    className={`flex flex-col items-center min-w-[52px] p-2 rounded-xl border transition-all text-xs font-bold ${selectedDate === day.fullDate
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                                        }`}
                                >
                                    <span className={`text-[9px] font-semibold uppercase ${selectedDate === day.fullDate ? 'text-indigo-200' : 'text-slate-400'}`}>{day.displayDay}</span>
                                    <span className="text-base font-extrabold my-0.5">{day.displayDate}</span>
                                    <span className={`text-[9px] ${selectedDate === day.fullDate ? 'text-indigo-200' : 'text-slate-500'}`}>{day.displayMonth}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Time slots */}
                {selectedDate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Select Time
                        </p>
                        {currentSlots.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No slots for this day.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {currentSlots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedSlot === slot
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-400'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Confirm button */}
                {selectedDate && selectedSlot && (
                    <motion.button
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleBook}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all shadow-md"
                    >
                        {submitting ? (
                            <span className="animate-pulse">Processing...</span>
                        ) : (
                            <><CheckCircle className="w-4 h-4" /> Confirm Appointment</>
                        )}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

// ─── Main Chatbot component ──────────────────────────────────────────────────
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [bookingDoctor, setBookingDoctor] = useState(null); // doctor selected for in-chat booking
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, bookingDoctor]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 1, type: 'bot', isWelcome: true,
                text: 'Hello! I am **Chopper AI**, your intelligent health assistant. Describe your symptoms and I will suggest possible conditions and connect you with the best specialists in our network.',
            }]);
        }
    }, [isOpen]);

    const handleSend = async (textToProcess = input) => {
        const trimmed = textToProcess.trim();
        if (!trimmed) return;

        const userMsg = { id: Date.now(), type: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setBookingDoctor(null);

        // ── Greeting detection (no API call needed) ──
        if (GREETING_PATTERNS.test(trimmed)) {
            await new Promise(r => setTimeout(r, 600)); // small delay for realism
            setMessages(prev => [...prev, {
                id: Date.now() + 1, type: 'bot',
                text: "Hello! 👋 It's great to hear from you. I'm Chopper AI, your personal health assistant. To help you best, could you describe any symptoms you're experiencing? I can suggest possible conditions and connect you with top-rated specialists."
            }]);
            setIsLoading(false);
            return;
        }

        // ── Non-symptom fallback ──
        if (!SYMPTOM_KEYWORDS.test(trimmed) && trimmed.length < 80) {
            await new Promise(r => setTimeout(r, 500));
            setMessages(prev => [...prev, {
                id: Date.now() + 1, type: 'bot',
                text: "I appreciate your message! As a health assistant, I'm best equipped to help you with **symptom analysis** and **doctor recommendations**. Please describe any symptoms you're experiencing — for example, 'I have a sore throat and mild fever' — and I'll guide you from there.",
                isFallback: true
            }]);
            setIsLoading(false);
            return;
        }

        // ── Symptom analysis via AI ──
        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/analyze-symptoms', { query: trimmed });
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                ...data.analysis,
                doctors: data.doctors
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1, type: 'bot',
                text: "I'm experiencing a momentary connection issue. Please give me a second and try again.",
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleBookingDone = () => {
        setBookingDoctor(null);
        const dashboardPath = userInfo?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
        navigate(dashboardPath);
        setIsOpen(false);
    };

    const suggestedSymptoms = ["🌡️ Fever & chills", "😫 Persistent headache", "🤕 Joint pain", "🫀 Chest tightness"];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* ─── CHAT WINDOW ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="mb-6 w-[380px] sm:w-[430px] h-[680px] max-h-[88vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-100 flex flex-col overflow-hidden"
                    >
                        {/* ── Header ──────────────────────────────────────────────── */}
                        <div className="px-5 py-4 flex items-center justify-between text-white relative overflow-hidden bg-slate-900 flex-shrink-0">
                            <div className="absolute inset-0 opacity-40">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-screen filter blur-[30px]" />
                                <div className="absolute top-10 right-0 w-32 h-32 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[30px]" />
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="relative">
                                    <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner overflow-hidden border border-white/20">
                                        <img src={auraAvatar} alt="Chopper AI" className="w-full h-full object-cover scale-110" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                                        Chopper AI <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                                    </h3>
                                    <p className="text-[11px] text-indigo-200 font-medium tracking-wide">Intelligent Health Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-white/10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* ── Messages Area ────────────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[92%] flex items-end gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Bot avatar */}
                                        {msg.type === 'bot' && (
                                            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm self-start mt-1">
                                                <img src={auraAvatar} alt="Chopper AI" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div className={`p-4 rounded-[1.2rem] shadow-sm text-sm ${msg.type === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
                                            }`}>

                                            {/* Plain text (welcome, greeting, fallback, error) */}
                                            {msg.text && (
                                                <p className="leading-relaxed">
                                                    {msg.text.split('**').map((chunk, i) =>
                                                        i % 2 === 1
                                                            ? <strong key={i} className={`font-extrabold ${msg.type === 'user' ? 'text-white' : 'text-indigo-600'}`}>{chunk}</strong>
                                                            : chunk
                                                    )}
                                                </p>
                                            )}

                                            {/* Structured AI analysis response */}
                                            {msg.possibleConditions && (
                                                <div className="space-y-4">
                                                    <p className="leading-relaxed text-slate-600 text-sm">
                                                        Based on your symptoms, here are some possible insights. Please remember to consult a verified specialist for a clinical evaluation.
                                                    </p>

                                                    {/* Conditions */}
                                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Identified Patterns</span>
                                                        <ul className="space-y-1.5">
                                                            {msg.possibleConditions.map((cond, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm font-semibold text-slate-800">
                                                                    <Activity className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                                                                    <span>{cond}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Specialty */}
                                                    <div className="bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                                        <div>
                                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5 block">Suggested Path</span>
                                                            <span className="font-extrabold text-indigo-700 text-lg">{msg.recommendedSpecialty}</span>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <HeartPulse className="w-4 h-4" />
                                                        </div>
                                                    </div>

                                                    {/* Doctor cards */}
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Top Rated Specialists</span>
                                                        {msg.doctors && msg.doctors.length > 0 ? (
                                                            <div className="space-y-2.5">
                                                                {msg.doctors.map((doc, dIdx) => (
                                                                    <div key={dIdx}>
                                                                        {/* Doctor Card */}
                                                                        <div
                                                                            className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between group cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all"
                                                                            onClick={() => {
                                                                                if (userInfo) {
                                                                                    setBookingDoctor(bookingDoctor?._id === doc._id ? null : doc);
                                                                                } else {
                                                                                    navigate(`/book/${doc._id}`);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <img
                                                                                    src={doc.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=c084fc&color=fff&size=50`}
                                                                                    alt={doc.name}
                                                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                                                                />
                                                                                <div>
                                                                                    <h4 className="font-extrabold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">{doc.name}</h4>
                                                                                    <p className="text-xs text-slate-500 font-medium">{doc.specialty}</p>
                                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">{doc.averageRating}★</span>
                                                                                        <span className="text-[10px] text-slate-400 font-medium">({doc.totalReviews} reviews)</span>
                                                                                        <span className="text-[10px] text-indigo-600 font-bold">${doc.consultationFee}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <button className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                                                                                <ArrowRight className="w-4 h-4" />
                                                                            </button>
                                                                        </div>

                                                                        {/* In-chat booking widget for this doctor */}
                                                                        {bookingDoctor?._id === doc._id && userInfo && (
                                                                            <BookingWidget
                                                                                doctor={doc}
                                                                                userInfo={userInfo}
                                                                                onBooked={handleBookingDone}
                                                                            />
                                                                        )}
                                                                        {bookingDoctor?._id === doc._id && !userInfo && null}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-center">
                                                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                                                                    <HeartPulse className="w-5 h-5" />
                                                                </div>
                                                                <p className="text-sm font-semibold text-slate-700">No specialists available at this time</p>
                                                                <p className="text-xs text-slate-500 mt-1">Please try again later or consult a general physician.</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Disclaimer */}
                                                    {msg.disclaimer && (
                                                        <div className="bg-amber-50 border-l-[3px] border-amber-400 p-3 rounded-r-xl">
                                                            <p className="text-[10px] font-bold text-amber-800 leading-relaxed">{msg.disclaimer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="flex items-end gap-2.5">
                                        <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm opacity-70">
                                            <img src={auraAvatar} alt="Chopper AI" className="w-full h-full object-cover grayscale" />
                                        </div>
                                        <div className="px-5 py-4 rounded-[1.25rem] bg-white border border-slate-100 shadow-sm rounded-bl-sm flex gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* ── Input Area ───────────────────────────────────────────── */}
                        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                            {messages.length < 3 && input.length === 0 && !isLoading && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                                    {suggestedSymptoms.map((sym, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(sym.replace(/[^\w\s&]/g, '').trim())}
                                            className="whitespace-nowrap px-4 py-2 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-full transition-all border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                        >
                                            {sym}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                            <div className="relative flex items-center">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Tell me how you're feeling..."
                                    className="w-full bg-slate-50 border border-slate-200 border-b-2 rounded-2xl pl-5 pr-14 py-4 text-sm font-medium outline-none focus:border-indigo-500 resize-none h-14 overflow-hidden transition-colors"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-[0.8rem] flex items-center justify-center transition-all transform active:scale-95 shadow-sm"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── FLOATING CHAT BUTTON ──────────────────────────────────────── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-4 bg-white pl-2 pr-6 py-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden relative cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                                <img src={auraAvatar} alt="Chopper AI" className="w-full h-full object-cover" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-10" />
                        </div>
                        <div className="flex flex-col items-start relative z-10 text-left">
                            <span className="font-extrabold text-[#111827] text-[15px] leading-tight flex items-center gap-1.5">
                                Ask Chopper AI <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                            </span>
                            <span className="text-xs font-semibold text-slate-500">Your health co-pilot</span>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
