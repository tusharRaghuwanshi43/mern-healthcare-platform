import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Users, CheckCircle, Shield, Clock, Layout, HeartPulse, Microscope, Activity, Stethoscope, CalendarCheck, CreditCard, Quote, Search } from 'lucide-react';
import doctorPortrait from '../assets/doctor_portrait.png';
import femaleSpecialist from '../assets/female_specialist.png';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import api from '../utils/api';
import logo from '../assets/logo.png';
import DemoModal from '../components/DemoModal';
import HeroSection from '../components/HeroSection';
const Landing = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [topDoctors, setTopDoctors] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [showDemo, setShowDemo] = useState(false);
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await api.get('/api/doctors');
                // Sort by averageRating descending, take top 3
                const sorted = [...data].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 3);
                setTopDoctors(sorted);
            } catch (err) {
                console.error('Failed to load doctors for landing:', err);
            }
        };
        const fetchReviews = async () => {
            try {
                setLoadingReviews(true);
                const { data } = await api.get('/api/doctors/reviews/all');
                setReviews(data);
            } catch (err) {
                console.error('Failed to load reviews for landing:', err);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchDoctors();
        fetchReviews();
    }, []);
    if (userInfo) {
        if (userInfo.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
        if (userInfo.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/patient/dashboard" replace />;
    }
    return (
        <div id="home" className="w-full bg-white font-sans overflow-x-hidden transition-colors duration-300">
            {/* HERO SECTION */}
            <HeroSection onWatchDemo={() => setShowDemo(true)} />
            {/* HOW IT WORKS */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
                <div className="text-center mb-16">
                    <span className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest text-sm block mb-3">How It Works</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white leading-tight">Book in 3 Simple Steps</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { step: '01', icon: <Search className="w-8 h-8" />, title: 'Find Your Partner', desc: 'Browse verified Care Partners filtered by specialty, rating, and availability. View real patient reviews.' },
                        { step: '02', icon: <CalendarCheck className="w-8 h-8" />, title: 'Request Appointment', desc: 'Pick a date and time slot. Your request goes to the Partner for acceptance — no upfront payment.' },
                        { step: '03', icon: <CreditCard className="w-8 h-8" />, title: 'Pay & Consult', desc: 'Once confirmed, pay securely via Stripe. Get digital prescriptions and manage everything in your dashboard.' }
                    ].map((item, idx) => (
                        <motion.div key={idx} whileHover={{ y: -6 }} className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm text-center group">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-extrabold text-sm shadow-lg shadow-blue-700/30">{item.step}</div>
                            <div className="w-16 h-16 mx-auto bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 mt-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">{item.icon}</div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{item.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
            {/* ABOUT SECTION */}
            <section id="about" className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="w-full h-[540px] rounded-[3rem] bg-gradient-to-tr from-primary-100 dark:from-primary-900/30 to-indigo-50 dark:to-indigo-900/20 relative overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl group">
                            <img src={doctorPortrait} alt="Verified Professional" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent"></div>
                            <div className="absolute top-12 left-10 right-10 z-10">
                                <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest mb-4 inline-block shadow-lg shadow-emerald-500/20">Certified Specialist</span>
                                <h3 className="text-white text-4xl font-black mb-4 tracking-tighter leading-none">Redefining <br />Clinical Excellence</h3>
                                <p className="text-slate-100/90 font-medium text-lg leading-relaxed max-w-[280px]">Direct access to top-tier care partners vetted for your safety.</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 right-2 md:bottom-16 md:-right-10 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 transform hover:scale-105 transition-transform z-20">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center"><Microscope className="w-6 h-6" /></div>
                                <h4 className="text-3xl font-black text-slate-800 dark:text-white">100%</h4>
                            </div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Medical Accuracy Rate</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <span className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest text-sm block mb-3">About The Platform</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white leading-tight break-words">Bridging The Gap Between Care Partners & Patients</h2>
                        </div>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            Appointy isn't just a booking engine; it's a complete clinical workspace. For patients, it provides immediate access to thousands of verified Care Partners. For providers, it automates scheduling, digital prescriptions, and payout gateways so they focus entirely on care.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6" /></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">Data Privacy</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">HIPAA compliant records.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0"><Clock className="w-6 h-6" /></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">24/7 Access</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Book at your convenience.</p>
                                </div>
                            </div>
                        </div>
                        <Link to="/signup" className="inline-flex items-center gap-2 text-primary-600 font-bold text-lg hover:text-primary-700 transition-colors pt-4 group">
                            Learn More About Our Mission
                            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>
            {/* EXTENDED FEATURES GRID */}
            <div className="w-full bg-slate-900 py-16 lg:py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-15"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500 rounded-full mix-blend-screen filter blur-[120px] opacity-15"></div>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-16 relative z-10 items-center">
                    <div className="w-full lg:w-1/2 text-white pb-6 lg:pb-0 pr-0 lg:pr-10">
                        <span className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-4 block">The Ecosystem</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight uppercase tracking-tighter break-words">THE ULTIMATE CARE ECOSYSTEM.</h2>
                        <div className="relative mb-10 rounded-3xl overflow-hidden border-2 border-slate-700/50 shadow-2xl group">
                            <img src={femaleSpecialist} alt="Specialized Care" className="w-full h-64 object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-8">
                                <p className="text-blue-400 font-bold text-sm tracking-widest">GLOBAL STANDARDS</p>
                                <h4 className="text-white font-black text-xl tracking-tight">Specialized Medical Insights</h4>
                            </div>
                        </div>
                        <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                            Experience clinical superiority. Our network is onboarded through rigorous vetting to ensure you only consult with world-class specialists using real-time availability tech.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-700"><Users className="w-5 h-5 text-primary-400" /></div>
                                <div><h4 className="font-bold text-white text-lg">Unified Portals</h4><p className="text-slate-400 text-sm">Switch seamlessly between Patient and Provider views.</p></div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-700"><Activity className="w-5 h-5 text-secondary-400" /></div>
                                <div><h4 className="font-bold text-white text-lg">Stripe Integrated Gateway</h4><p className="text-slate-400 text-sm">Instant, bank-grade secure consultation payments.</p></div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 grid grid-cols-2 gap-6 pt-10">
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-700 shadow-2xl flex flex-col items-start translate-y-8 hover:bg-slate-800 transition-colors">
                            <Shield className="w-12 h-12 text-primary-400 mb-6 bg-slate-900 p-3 rounded-2xl" />
                            <h4 className="text-xl font-bold text-white mb-2">Secure Records</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">End-to-end encrypted medical data storage.</p>
                        </div>
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-700 shadow-2xl flex flex-col items-start hover:bg-slate-800 transition-colors">
                            <Clock className="w-12 h-12 text-secondary-400 mb-6 bg-slate-900 p-3 rounded-2xl" />
                            <h4 className="text-xl font-bold text-white mb-2">Instant Slots</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">Book directly with real-time Care Partner availability sync.</p>
                        </div>
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-700 shadow-2xl flex flex-col items-start translate-y-8 hover:bg-slate-800 transition-colors">
                            <CheckCircle className="w-12 h-12 text-green-400 mb-6 bg-slate-900 p-3 rounded-2xl" />
                            <h4 className="text-xl font-bold text-white mb-2">Verified Partners</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">Strict background onboarding for Care Partners.</p>
                        </div>
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-700 shadow-2xl flex flex-col items-start hover:bg-slate-800 transition-colors">
                            <Layout className="w-12 h-12 text-blue-400 mb-6 bg-slate-900 p-3 rounded-2xl" />
                            <h4 className="text-xl font-bold text-white mb-2">Clean Portal</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">Modern, intuitive dashboards tailored to your role.</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* TESTIMONIALS */}
            <section className="relative py-20 lg:py-28 overflow-hidden z-0 border-t border-slate-100 dark:border-slate-800">

                {/* Healthcare Background Image for Testimonials */}
                <div className="absolute inset-0 -z-20">
                    <img
                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80"
                        alt="Clean Clinic Background"
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                {/* Light/Dark overlay to ensure cards pop while keeping the medical background visible */}
                <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm -z-10"></div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16 relative">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center justify-center gap-2 mb-4 bg-amber-50 dark:bg-amber-900/40 border border-amber-100 dark:border-amber-800/50 px-4 py-1.5 rounded-full shadow-sm">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
                            </div>
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Rated 4.9/5 by Patients</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white leading-tight mt-2">
                            Real Stories from <br className="hidden md:block" /> Real Patients
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {loadingReviews ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse h-72"></div>
                            ))
                        ) : reviews.length > 0 ? (
                            reviews.slice(0, 3).map((t, idx) => (
                                <motion.div key={t._id || idx} whileHover={{ y: -8 }} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none relative h-full flex flex-col group transition-all">
                                    <Quote className="w-14 h-14 text-primary-100 dark:text-slate-800 absolute top-8 right-8 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300" />

                                    <div className="flex items-center gap-1.5 mb-6 relative z-10">
                                        {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                                        {Array.from({ length: 5 - t.rating }).map((_, i) => <Star key={i} className="w-5 h-5 text-slate-200 dark:text-slate-700" />)}
                                    </div>

                                    {/* INCREASED FONT SIZE FOR REVIEW TEXT */}
                                    <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 font-semibold leading-relaxed mb-10 italic flex-grow relative z-10">"{t.comment}"</p>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center text-primary-700 dark:text-white font-black text-xl overflow-hidden shadow-inner border border-white dark:border-slate-600">
                                                {t.patient?.profilePhoto ? (
                                                    <img src={t.patient.profilePhoto} alt={t.patient.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    t.patient?.name?.charAt(0) || 'P'
                                                )}
                                            </div>
                                            <div>
                                                {/* INCREASED FONT SIZE FOR PATIENT NAME */}
                                                <span className="font-black text-slate-800 dark:text-white block text-base md:text-lg">{t.patient?.name || 'Anonymized Patient'}</span>
                                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Verified Patient</span>
                                            </div>
                                        </div>
                                        <div className="text-right bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <span className="text-[10px] text-primary-600 dark:text-primary-400 font-black uppercase tracking-widest block mb-1">Consulted</span>
                                            <span className="text-sm text-slate-700 dark:text-slate-300 font-bold">Dr. {t.doctor?.name?.split(' ').pop()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-slate-500">
                                    <Quote className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-300">No reviews yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Become our first patient to share your experience!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* CALL TO ACTION */}
            <section className="relative py-15 lg:py-20 bg-white dark:bg-slate-950 text-center px-6 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary-100/40 dark:bg-primary-900/10 rounded-full mix-blend-multiply filter blur-[80px] -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-sky-100/40 dark:bg-sky-900/10 rounded-full mix-blend-multiply filter blur-[80px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <span className="text-primary-600 dark:text-primary-400 font-black uppercase tracking-[0.2em] text-sm mb-6 block">Ready to take the next step?</span>
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">
                        PRIORITIZE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">HEALTH</span> TODAY.
                    </h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium">Join thousands of patients experiencing the future of digital healthcare. No credit card required for signup.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-black text-lg py-5 px-14 rounded-2xl shadow-2xl shadow-primary-500/40 transform hover:-translate-y-1.5 transition-all">
                            GET STARTED NOW
                        </Link>
                    </div>
                </div>
            </section>
            {/* FOOTER */}
            <footer className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden">
                {/* Decorative gradient orbs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
                    {/* Top Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
                        {/* Brand Column */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center space-x-2.5 mb-5">
                                <img src={logo} alt="logo" className="h-9 w-auto object-contain brightness-0 invert" />
                                <span className="font-extrabold text-2xl tracking-tight">Appointy</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
                                Your trusted healthcare companion. Book appointments, consult specialists, and manage your health — all in one platform.
                            </p>
                            {/* Social Icons */}
                            <div className="flex items-center gap-3">
                                <a href="https://github.com/tusharRaghuwanshi43" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:border-primary-500 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-500/20">
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                                </a>
                                <a href="https://www.linkedin.com/in/tusharraghuwanshi" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#0077B5] hover:border-[#0077B5] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#0077B5]/20">
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                                <a href="mailto:tusharraghuwanshi82@gmail.com" className="group w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-red-500 hover:border-red-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20">
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-5">Quick Links</h4>
                            <ul className="space-y-3">
                                <li><Link to="/#home" className="text-slate-400 hover:text-white text-sm font-medium transition-colors hover:translate-x-1 inline-block">Home</Link></li>
                                <li><Link to="/#about" className="text-slate-400 hover:text-white text-sm font-medium transition-colors hover:translate-x-1 inline-block">About Us</Link></li>
                                <li><Link to="/contact" className="text-slate-400 hover:text-white text-sm font-medium transition-colors hover:translate-x-1 inline-block">Contact Us</Link></li>
                                <li><Link to="/doctors" className="text-slate-400 hover:text-white text-sm font-medium transition-colors hover:translate-x-1 inline-block">Find a Doctor</Link></li>
                            </ul>
                        </div>

                        {/* Services */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-5">Services</h4>
                            <ul className="space-y-3">
                                <li><span className="text-slate-400 text-sm font-medium">Appointment Booking</span></li>
                                <li><span className="text-slate-400 text-sm font-medium">AI Symptom Checker</span></li>
                                <li><span className="text-slate-400 text-sm font-medium">Digital Prescriptions</span></li>
                            </ul>
                        </div>

                        {/* Connect */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-5">Connect</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="mailto:tusharraghuwanshi82@gmail.com" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        tusharraghuwanshi82@gmail.com
                                    </a>
                                </li>
                                <li>
                                    <a href="https://github.com/tusharRaghuwanshi43" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                                        tusharRaghuwanshi43
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.linkedin.com/in/tusharraghuwanshi" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        Tushar Raghuwanshi
                                    </a>
                                </li>
                                <li>
                                    <a href="https://github.com/tusharRaghuwanshi43/mern-healthcare-platform" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                        Source Code
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-sm font-medium">
                            © {new Date().getFullYear()} Appointy. Designed & Developed by <a href="https://github.com/tusharRaghuwanshi43" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">Tushar Raghuwanshi</a>
                        </p>
                        <div className="flex gap-6 text-sm font-medium text-slate-500">
                            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
            <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
        </div>
    );
};
export default Landing;