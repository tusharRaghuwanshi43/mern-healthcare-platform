import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, ArrowRight, HeartPulse, Sparkles, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import auraAvatar from '../assets/aura_avatar.png';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 1,
                type: 'bot',
                text: 'Hi there! I am **Chopper AI**, your personal healthcare assistant. Describe your symptoms below, and I can suggest possible conditions and map you to the best specialists in our network.',
                isWelcome: true
            }]);
        }
    }, [isOpen]);

    const handleSend = async (textToProcess = input) => {
        if (!textToProcess.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: textToProcess };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/analyze-symptoms', { query: textToProcess });

            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                ...data.analysis,
                doctors: data.doctors
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: "I'm experiencing a momentary connection issue. Please give me a second and try again.",
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestedSymptoms = ["🌡️ Fever & chills", "😫 Persistent headache", "🤕 Joint pain", "🫀 Chest tightness"];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mb-6 w-[380px] sm:w-[420px] h-[650px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden relative"
                    >
                        {/* HEADER */}
                        <div className="px-5 py-4 flex items-center justify-between text-white relative overflow-hidden bg-slate-900">
                            {/* Abstract Header Background */}
                            <div className="absolute inset-0 opacity-40">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-screen filter blur-[30px]"></div>
                                <div className="absolute top-10 right-0 w-32 h-32 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[30px]"></div>
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                                <div className="relative">
                                    <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner overflow-hidden border border-white/20">
                                        <img src={auraAvatar} alt="Chopper AI" className="w-full h-full object-cover scale-110" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                                        Chopper AI
                                        <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
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

                        {/* MESSAGES AREA */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-7 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 bg-slate-50 dark:bg-slate-950/80">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[88%] flex items-end gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Avatar Thumbnail for Bot */}
                                        {msg.type === 'bot' && (
                                            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <img src={auraAvatar} alt="Nova AI" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        {/* Content Bubble */}
                                        <div className={`p-4 rounded-[1.25rem] shadow-sm text-sm ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}>

                                            {/* Standard Text */}
                                            {msg.text && (
                                                <p className="leading-relaxed">
                                                    {/* Very basic bold rendering for the welcome text */}
                                                    {msg.text.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-indigo-600 dark:text-indigo-400">{chunk}</strong> : chunk)}
                                                </p>
                                            )}
                                            {msg.isError && <p className="leading-relaxed text-rose-500 font-medium">{msg.text}</p>}

                                            {/* AI Structured Response */}
                                            {msg.possibleConditions && (
                                                <div className="space-y-5">

                                                    {/* Explanatory Paragraph */}
                                                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                                                        Based on your symptoms, there are a few potential paths to explore. While I help guide you, please remember to consult an officially verified specialist for a clinical evaluation.
                                                    </p>

                                                    {/* Conditions List */}
                                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Identified Patterns</span>
                                                        <ul className="space-y-2">
                                                            {msg.possibleConditions.map((cond, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                                    <Activity className="w-4 h-4 text-rose-400 mt-0.5" />
                                                                    <span>{cond}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Recommended Specialty Banner */}
                                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-between">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5 block">Suggested Path</span>
                                                            <span className="font-extrabold text-indigo-700 dark:text-indigo-300 text-lg">{msg.recommendedSpecialty}</span>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                            <HeartPulse className="w-4 h-4" />
                                                        </div>
                                                    </div>

                                                    {/* Doctor Recommendations OR Fallback */}
                                                    <div className="pt-2">
                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 block">Top Rated Specialists</span>

                                                        {msg.doctors && msg.doctors.length > 0 ? (
                                                            <div className="space-y-2.5">
                                                                {msg.doctors.map((doc, dIdx) => (
                                                                    <div key={dIdx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between group cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-300" onClick={() => navigate(`/book/${doc._id}`)}>
                                                                        <div className="flex items-center gap-3">
                                                                            <img src={doc.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=c084fc&color=fff&size=50`} className="w-11 h-11 rounded-full object-cover border border-slate-100" alt={doc.name} />
                                                                            <div>
                                                                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate w-36">{doc.name}</h4>
                                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">{doc.averageRating}★</span>
                                                                                    <span className="text-[10px] text-slate-500 font-medium">({doc.totalReviews} reviews)</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-colors">
                                                                            <ArrowRight className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            // Explicit Fallback Handling
                                                            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-center">
                                                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                                                                    <User className="w-5 h-5" />
                                                                </div>
                                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Currently not available</p>
                                                                <p className="text-xs text-slate-500 mt-1">Please try again later or consult a general physician.</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {msg.disclaimer && (
                                                        <div className="mt-4 bg-amber-50/80 dark:bg-amber-900/10 border-l-[3px] border-amber-400 p-3 rounded-r-xl">
                                                            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-500 leading-relaxed text-justify">{msg.disclaimer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* LOADING TYPING INDICATOR */}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="flex items-end gap-2.5">
                                        <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm opacity-70">
                                            <img src={auraAvatar} alt="Nova AI" className="w-full h-full object-cover grayscale" />
                                        </div>
                                        <div className="px-5 py-4 rounded-[1.25rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-bl-sm flex gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* INPUT AREA */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                            {/* Suggestions (only when input is empty and few messages) */}
                            {messages.length < 3 && input.length === 0 && !isLoading && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-none px-1">
                                    {suggestedSymptoms.map((sym, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(sym.replace(/[^a-zA-Z\s]/g, '').trim())} // strip emojis before sending
                                            className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-full transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                        >
                                            {sym}
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            <div className="relative flex items-center group">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Tell me how you're feeling..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 border-b-2 dark:border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-0 resize-none h-14 overflow-hidden transition-colors"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 text-white rounded-[0.8rem] flex items-center justify-center transition-all duration-300 transform active:scale-95 disabled:active:scale-100 shadow-sm"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FLOATING CHAT BUTTON (VISUALLY PROMINENT) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-4 bg-white dark:bg-slate-900 pl-2 pr-6 py-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-700 overflow-hidden relative cursor-pointer"
                    >
                        {/* Dynamic Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                                <img src={auraAvatar} alt="Nova AI" className="w-full h-full object-cover" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full z-10"></span>
                        </div>

                        <div className="flex flex-col items-start relative z-10 text-left">
                            <span className="font-extrabold text-[#111827] dark:text-white text-[15px] leading-tight flex items-center gap-1.5">
                                Ask Chopper AI
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your health co-pilot</span>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
