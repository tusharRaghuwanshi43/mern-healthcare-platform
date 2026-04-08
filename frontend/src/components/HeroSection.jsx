import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
    ArrowRight, Play, Star, ShieldCheck, Zap,
    Users, ChevronRight, FileText, BadgeCheck, Clock3
} from 'lucide-react';
import api from '../utils/api';
import DemoModal from './DemoModal';

/* ─────────────────────────────────────────
   DOCTOR SPOTLIGHT — smooth cycling via AnimatePresence
───────────────────────────────────────── */
const DoctorSpotlight = ({ doctors, loading }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const cardRef = useRef(null);
    const badgeRef1 = useRef(null);
    const badgeRef2 = useRef(null);

    // GSAP floating badges — only decorative, no content visibility issues
    useEffect(() => {
        if (!badgeRef1.current || !badgeRef2.current) return;
        gsap.to(badgeRef1.current, { y: -10, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to(badgeRef2.current, { y: 12, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6 });
    }, []);

    // Auto-cycle doctors every 4s
    useEffect(() => {
        if (doctors.length < 2) return;
        const interval = setInterval(() => {
            setActiveIdx(i => (i + 1) % doctors.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [doctors]);

    const doc = doctors[activeIdx];

    return (
        <div ref={cardRef} className="relative w-full max-w-[400px] mx-auto lg:mx-0">
            {/* Main card */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-blue-200/50 border border-blue-100/60 overflow-hidden">

                {/* Header gradient band — prominent dark navy */}
                <div className="h-36 w-full relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2557 45%, #1e40af 100%)' }}>
                    {/* Dot mesh pattern */}
                    <div className="absolute inset-0"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />
                    {/* Subtle top glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
                    {/* "Top Specialist" pill */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                        Top Rated Specialist
                    </div>
                </div>

                {/* Avatar — overlapping the gradient band */}
                <div className="absolute top-16 left-6 w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100 z-10">
                    {loading ? (
                        <div className="w-full h-full bg-slate-200 animate-pulse" />
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={doc?._id || 'empty'}
                                src={doc?.profilePhoto || (doc ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=dbeafe&color=1d4ed8&size=200&bold=true` : '')}
                                alt={doc?.name || ''}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>
                    )}
                </div>

                {/* Body */}
                <div className="pt-16 px-6 pb-5 min-h-[220px]">
                    {loading ? (
                        <div className="space-y-3 animate-pulse pt-2">
                            <div className="h-5 bg-slate-200 rounded-full w-2/3" />
                            <div className="h-4 bg-blue-100 rounded-full w-1/3" />
                            <div className="flex gap-2 mt-3">
                                <div className="h-7 bg-slate-100 rounded-full w-20" />
                                <div className="h-7 bg-slate-100 rounded-full w-28" />
                            </div>
                            <div className="h-12 bg-slate-100 rounded-2xl w-full mt-2" />
                        </div>
                    ) : doc ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={doc._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="pt-2"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg leading-tight">{doc.name}</h3>
                                        <p className="text-blue-600 font-semibold text-sm mt-0.5">{doc.specialty || 'Specialist'}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="flex items-center gap-0.5 justify-end">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(doc.averageRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{doc.totalReviews || 0} reviews</p>
                                    </div>
                                </div>

                                {/* Chips */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                                        {doc.experience ? `${doc.experience}y exp` : 'Verified'}
                                    </span>
                                    <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-100">
                                        {doc.consultationFee ? `₹${doc.consultationFee} / visit` : 'Available Today'}
                                    </span>
                                </div>

                                <Link
                                    to={`/book/${doc._id}`}
                                    className="mt-4 flex w-full items-center justify-center gap-2 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-2xl transition-all hover:-translate-y-0.5 shadow-md shadow-blue-200"
                                >
                                    Book Appointment
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="pt-4 text-center">
                            <p className="text-slate-400 text-sm">Connecting to network...</p>
                        </div>
                    )}
                </div>

                {/* Navigation dots */}
                {doctors.length > 0 && (
                    <div className="flex items-center justify-center gap-1.5 pb-4">
                        {doctors.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIdx(i)}
                                className={`rounded-full transition-all duration-300 ${i === activeIdx ? 'w-5 h-2 bg-blue-600' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating badge 1 — Moved to bottom left area so it doesn't block the face */}
            <div ref={badgeRef1} className="absolute -left-12 bottom-47 z-20 flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                    <p className="text-xs font-black text-slate-800 leading-tight">Instant Booking</p>
                    <p className="text-[10px] text-slate-400 font-medium">Confirm in 60s</p>
                </div>
            </div>

            {/* Floating badge 2 — Moved to top right area */}
            <div ref={badgeRef2} className="absolute -right-16 bottom-25 z-20 flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-black text-slate-800 leading-tight">Secure & Private</p>
                    <p className="text-[10px] text-slate-400 font-medium">HIPAA Compliant</p>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   LEFT COLUMN ANIMATION VARIANTS
───────────────────────────────────────── */
const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

/* ─────────────────────────────────────────
   MAIN HERO
───────────────────────────────────────── */
const HeroSection = ({ onWatchDemo }) => {
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState({ totalDoctors: 0, avgRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [showDemo, setShowDemo] = useState(false);
    const badgeFloatRef1 = useRef(null);
    const badgeFloatRef2 = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/api/doctors');
                const totalDoctors = data.length;
                const ratedDoctors = data.filter(d => d.averageRating > 0);
                const avgRating = ratedDoctors.length > 0
                    ? (ratedDoctors.reduce((sum, d) => sum + d.averageRating, 0) / ratedDoctors.length).toFixed(1)
                    : '4.9';
                const totalReviews = data.reduce((sum, d) => sum + (d.totalReviews || 0), 0);
                setStats({ totalDoctors, avgRating, totalReviews });
                const top3 = [...data]
                    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                    .slice(0, 3);
                setDoctors(top3);
            } catch (err) {
                console.error('Hero fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const trust = [
        { icon: <FileText className="w-4 h-4 text-blue-600" />, text: 'Instant Digital Prescriptions' },
        { icon: <Clock3 className="w-4 h-4 text-teal-600" />, text: 'See a Doctor Today, No Waiting' },
        { icon: <ShieldCheck className="w-4 h-4 text-blue-600" />, text: 'Powered by AI for a Better Experience' },
    ];

    return (
        <>
            <section
                className="w-full pt-16 pb-0 overflow-x-hidden relative"
                style={{
                    background: 'linear-gradient(145deg, #dce8fb 0%, #eef2ff 40%, #d1faf4 100%)'
                }}
            >
                {/* Top decorative bar */}
                <div className="h-1 w-full" style={{
                    background: 'linear-gradient(90deg, #0f172a 0%, #2563eb 40%, #0d9488 70%, #1d4ed8 100%)'
                }} />

                {/* Background blobs — richer, more visible */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-10 right-[10%] w-[550px] h-[550px] rounded-full"
                        style={{ background: 'radial-gradient(circle, #bfdbfe 0%, transparent 65%)', opacity: 0.55 }} />
                    <div className="absolute top-32 left-[0%] w-[380px] h-[380px] rounded-full"
                        style={{ background: 'radial-gradient(circle, #99f6e4 0%, transparent 65%)', opacity: 0.4 }} />
                    <div className="absolute bottom-0 right-[25%] w-[300px] h-[300px] rounded-full"
                        style={{ background: 'radial-gradient(circle, #e0e7ff 0%, transparent 65%)', opacity: 0.5 }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20 flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">

                    {/* ── LEFT — Framer Motion stagger (no blank flash) ── */}
                    <motion.div
                        className="flex-1 max-w-[560px]"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Eyebrow */}
                        <motion.div variants={itemVariants}
                            className="inline-flex items-center gap-2 mb-7 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-60"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <span className="text-slate-800 font-semibold text-sm">
                                {/* Trusted by{' '}
                                <span className="text-blue-700 font-bold">
                                    {stats.totalDoctors > 0 ? `${stats.totalDoctors}+` : '500+'}
                                </span>{' '}
                                Verified Care Partners */}
                                AI-Powered Scheduling · Live
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1 variants={itemVariants}
                            className="text-[2.7rem] sm:text-5xl lg:text-[3.2rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-5">
                            Your Health Deserves{' '}
                            <span className="relative whitespace-nowrap">
                                <span className="relative z-10" style={{
                                    background: 'linear-gradient(135deg, #1d4ed8, #0d9488)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>Expert Care.</span>
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden>
                                    <path d="M0,5 Q50,0 100,5 Q150,10 200,5" stroke="#0d9488" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
                                </svg>
                            </span>
                        </motion.h1>

                        {/* Sub */}
                        <motion.p variants={itemVariants}
                            className="text-slate-600 text-lg leading-relaxed mb-8 max-w-[480px] font-medium">
                            Skip the waiting room. Connect with <span className="text-slate-800 font-semibold">verified Care Partners</span>, track prescriptions, and manage every visit — all in one intelligent, secure platform.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 mb-10">
                            <Link
                                to="/doctors"
                                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-300/40 hover:-translate-y-0.5"
                            >
                                Find a Care Partner
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <button
                                onClick={() => setShowDemo(true)}
                                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/80 hover:bg-white backdrop-blur-sm text-slate-800 font-bold rounded-xl border border-slate-200 transition-all hover:-translate-y-0.5 shadow-sm"
                            >
                                <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800 transition-colors pl-0.5">
                                    <Play className="w-3.5 h-3.5 text-white" />
                                </div>
                                See How It Works
                            </button>
                        </motion.div>

                        {/* Trust strip */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 pt-6 border-t border-blue-100/80">
                            {trust.map((t, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-white/80 border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                                        {t.icon}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">{t.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* ── RIGHT ── */}
                    <motion.div
                        className="flex-1 flex flex-col items-center lg:items-start gap-5 w-full lg:max-w-[420px]"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                    >
                        <DoctorSpotlight doctors={doctors} loading={loading} />

                        {/* Live stat pills */}
                        <div className="flex gap-4 w-full justify-center flex-wrap">
                            {[
                                { icon: <Users className="w-4 h-4 text-blue-600" />, val: stats.totalDoctors > 0 ? `${stats.totalDoctors}+` : '500+', label: 'Specialists' },
                                { icon: <Star className="w-4 h-4 text-amber-500" />, val: stats.avgRating || '4.9', label: 'Avg Rating' },
                                { icon: <FileText className="w-4 h-4 text-teal-600" />, val: stats.totalReviews > 0 ? `${stats.totalReviews}+` : '10k+', label: 'Reviews' },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl px-5 py-3 shadow-md flex-1 min-w-[140px] max-w-[180px] transition-all hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                        {s.icon}
                                    </div>

                                    {/* Text */}
                                    <div className="flex flex-col justify-center">
                                        <p className="text-base font-extrabold text-slate-800 leading-tight">
                                            {s.val}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">
                                            {s.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link to="/doctors" className="group flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors mx-auto lg:mx-0">
                            Browse all {stats.totalDoctors > 0 ? stats.totalDoctors : ''} specialists
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            </section>

            <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
        </>
    );
};

export default HeroSection;