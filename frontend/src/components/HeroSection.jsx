import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, Play, Star, Users, CheckCircle, Activity, Shield, Zap } from 'lucide-react';
const WORDS = ['SMARTER.', 'FASTER.', 'FEARLESS.', 'REIMAGINED.'];
const HeroSection = ({ onWatchDemo }) => {
    const heroRef = useRef(null);
    const orb1Ref = useRef(null);
    const orb2Ref = useRef(null);
    const orb3Ref = useRef(null);
    const headlineRef = useRef(null);
    const badgeRef = useRef(null);
    const subRef = useRef(null);
    const ctaRef = useRef(null);
    const statsRef = useRef(null);
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const wordTimerRef = useRef(null);
    const [wordIndex, setWordIndex] = useState(0);
    const [displayWord, setDisplayWord] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [charIndex, setCharIndex] = useState(0);
    // Typewriter effect
    useEffect(() => {
        const currentWord = WORDS[wordIndex];
        let timeout;
        if (!isDeleting) {
            if (charIndex < currentWord.length) {
                timeout = setTimeout(() => setCharIndex(c => c + 1), 80);
            } else {
                timeout = setTimeout(() => setIsDeleting(true), 1800);
            }
        } else {
            if (charIndex > 0) {
                timeout = setTimeout(() => setCharIndex(c => c - 1), 40);
            } else {
                setIsDeleting(false);
                setWordIndex(w => (w + 1) % WORDS.length);
            }
        }
        setDisplayWord(currentWord.slice(0, charIndex));
        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, wordIndex]);
    // Particle canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W = canvas.offsetWidth;
        let H = canvas.offsetHeight;
        canvas.width = W;
        canvas.height = H;
        const PARTICLE_COUNT = 55;
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2.5 + 1,
            alpha: Math.random() * 0.5 + 0.15,
        }));
        const drawFrame = () => {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
                ctx.fill();
            });
            // Draw connecting lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }
            animFrameRef.current = requestAnimationFrame(drawFrame);
        };
        drawFrame();
        const handleResize = () => {
            W = canvas.offsetWidth;
            H = canvas.offsetHeight;
            canvas.width = W;
            canvas.height = H;
        };
        window.addEventListener('resize', handleResize);
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    // GSAP entrance animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.from(badgeRef.current, { opacity: 0, y: -20, duration: 0.6 })
                .from(headlineRef.current, { opacity: 0, y: 50, duration: 0.8 }, '-=0.3')
                .from(subRef.current, { opacity: 0, y: 30, duration: 0.7 }, '-=0.5')
                .from(ctaRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
                .from(statsRef.current?.children ? [...statsRef.current.children] : [], {
                    opacity: 0, y: 30, stagger: 0.12, duration: 0.6
                }, '-=0.3');
            // Floating orbs
            gsap.to(orb1Ref.current, {
                x: 40, y: -30, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut'
            });
            gsap.to(orb2Ref.current, {
                x: -30, y: 50, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1
            });
            gsap.to(orb3Ref.current, {
                x: 25, y: -45, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2
            });
        }, heroRef);
        return () => ctx.revert();
    }, []);
    // Magnetic mouse orb follow
    useEffect(() => {
        const hero = heroRef.current;
        const orbs = [orb1Ref.current, orb2Ref.current, orb3Ref.current];
        const handleMouseMove = (e) => {
            const rect = hero.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width;
            const my = (e.clientY - rect.top) / rect.height;
            gsap.to(orbs[0], { x: mx * 80 - 40, y: my * 60 - 30, duration: 2, ease: 'power2.out' });
            gsap.to(orbs[1], { x: mx * -60 + 30, y: my * 80 - 40, duration: 3, ease: 'power2.out', delay: 0.1 });
            gsap.to(orbs[2], { x: mx * 40 - 20, y: my * -50 + 25, duration: 2.5, ease: 'power2.out', delay: 0.05 });
        };
        hero?.addEventListener('mousemove', handleMouseMove);
        return () => hero?.removeEventListener('mousemove', handleMouseMove);
    }, []);
    return (
        <div
            ref={heroRef}
            className="relative w-full min-h-screen overflow-hidden flex flex-col"
            style={{
                background: 'linear-gradient(135deg, #1a0533 0%, #3d0d6e 30%, #6b21a8 65%, #7c3aed 100%)'
            }}
        >
            {/* Particle canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
            {/* Gradient orbs */}
            <div ref={orb1Ref} className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)' }} />
            <div ref={orb2Ref} className="absolute bottom-[5%] right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
            <div ref={orb3Ref} className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)' }} />
            {/* Content */}
            <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 pt-32 lg:pt-40 pb-24 flex flex-col lg:flex-row gap-12 items-center">
                {/* LEFT: Text content */}
                <div className="flex-1 text-white space-y-8">
                    {/* Badge */}
                    <div ref={badgeRef} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                        </span>
                        <span className="text-sm font-semibold tracking-wide text-white/90">AI-Powered Scheduling · Live</span>
                    </div>
                    {/* Headline */}
                    <div ref={headlineRef}>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black leading-[1.0] tracking-tight">
                            <span className="block text-white">HEALTHCARE</span>
                            <span
                                className="block min-h-[1.1em]"
                                style={{
                                    background: 'linear-gradient(90deg, #e879f9, #818cf8, #38bdf8)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                {displayWord}
                                <span className="animate-pulse" style={{ WebkitTextFillColor: 'rgba(255,255,255,0.7)' }}>|</span>
                            </span>
                        </h1>
                    </div>
                    {/* Subtext */}
                    <p ref={subRef} className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed font-medium">
                        Skip the waiting room. Connect with <span className="text-fuchsia-300 font-bold">verified Care Partners</span>, manage secure health records, and experience clinical excellence&mdash;all from your screen.
                    </p>
                    {/* CTA Buttons */}
                    <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Link
                            to="/signup"
                            className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-extrabold text-base transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg, #e879f9, #7c3aed)', boxShadow: '0 0 40px rgba(232,121,249,0.4)' }}
                        >
                            <span className="relative z-10 tracking-wide">START FOR FREE</span>
                            <div className="relative z-10 w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        </Link>
                        <button
                            onClick={onWatchDemo}
                            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-white"
                        >
                            <div className="w-8 h-8 rounded-xl border border-white/30 flex items-center justify-center group-hover:border-white/60 transition-colors pl-0.5">
                                <Play className="w-3.5 h-3.5" />
                            </div>
                            <span className="tracking-wide">WATCH DEMO</span>
                        </button>
                    </div>
                    {/* Stats strip */}
                    <div ref={statsRef} className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                        {[
                            { icon: <Users className="w-4 h-4" />, value: '50,000+', label: 'Patients Served', color: 'text-sky-300' },
                            { icon: <Star className="w-4 h-4" />, value: '4.9 / 5', label: 'Avg Rating', color: 'text-amber-300' },
                            { icon: <CheckCircle className="w-4 h-4" />, value: '500+', label: 'Verified Partners', color: 'text-emerald-300' },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className={`${stat.color} opacity-80`}>{stat.icon}</div>
                                <div>
                                    <div className={`font-extrabold text-sm ${stat.color}`}>{stat.value}</div>
                                    <div className="text-white/40 text-xs font-medium">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* RIGHT: Interactive Card UI */}
                <div className="flex-1 hidden lg:flex justify-center items-center">
                    <HeroVisual />
                </div>
            </div>
            {/* Smoothed Wave Divider */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
                <svg
                    className="relative block w-full h-[60px] lg:h-[100px]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    style={{ transform: 'translateY(2px) scaleX(1.01)' }}
                >
                    <path
                        d="M0,120 C300,0 900,0 1200,120 L1200,120 L0,120 Z"
                        fill="#f8fafc"
                    />
                </svg>
            </div>
        </div>
    );
};
/* ── Right-side interactive mockup card ── */
const HeroVisual = () => {
    const cardRef = useRef(null);
    const card1Ref = useRef(null);
    const card2Ref = useRef(null);
    useEffect(() => {
        gsap.to(card1Ref.current, { y: -14, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to(card2Ref.current, { y: 18, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 });
        // Card tilt on mouse move
        const card = cardRef.current;
        const handleMove = (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const rx = ((e.clientY - cy) / rect.height) * 14;
            const ry = ((e.clientX - cx) / rect.width) * -14;
            gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.5, ease: 'power1.out', transformPerspective: 900 });
        };
        const handleLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' });
        card?.addEventListener('mousemove', handleMove);
        card?.addEventListener('mouseleave', handleLeave);
        return () => {
            card?.removeEventListener('mousemove', handleMove);
            card?.removeEventListener('mouseleave', handleLeave);
        };
    }, []);
    const doctors = [
        { name: 'Dr. Priya Sharma', spec: 'Cardiologist', rating: 4.9, img: 'PS', color: '#a855f7' },
        { name: 'Dr. Arjun Nair', spec: 'Neurologist', rating: 4.8, img: 'AN', color: '#3b82f6' },
        { name: 'Dr. Keerthi Rao', spec: 'Pediatrician', rating: 4.9, img: 'KR', color: '#10b981' },
    ];
    return (
        <div className="relative w-[420px] h-[560px]" style={{ perspective: '1200px' }}>
            {/* Main dashboard card */}
            <div
                ref={cardRef}
                className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 cursor-pointer"
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(20px)',
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)'
                }}
            >
                {/* Card header */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-fuchsia-400" />
                        <span className="text-white font-bold text-sm">Care Partner Network</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                        <div className="w-3 h-3 rounded-full bg-green-400/70" />
                    </div>
                </div>
                {/* Search bar */}
                <div className="px-6 py-3">
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/8 border border-white/10">
                        <Zap className="w-4 h-4 text-fuchsia-400" />
                        <span className="text-white/40 text-sm font-medium">Find a Care Partner...</span>
                        <span className="ml-auto text-white/20 text-xs border border-white/10 px-2 py-0.5 rounded-lg">⌘K</span>
                    </div>
                </div>
                {/* Doctor cards */}
                <div className="px-6 space-y-3 mt-1">
                    {doctors.map((doc, i) => (
                        <DoctorMiniCard key={i} doc={doc} delay={i * 0.15} />
                    ))}
                </div>
                {/* Bottom booking strip */}
                <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white/50 text-xs font-medium">Next Available</div>
                            <div className="text-white font-bold text-sm mt-0.5">Today · 11:00 AM</div>
                        </div>
                        <button
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #e879f9, #7c3aed)', boxShadow: '0 0 20px rgba(232,121,249,0.4)' }}
                        >
                            Book Now →
                        </button>
                    </div>
                </div>
            </div>
            {/* Floating badge 1 */}
            <div ref={card1Ref} className="absolute -left-12 top-16 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10"
                style={{ background: 'rgba(16,185,129,0.15)', backdropFilter: 'blur(20px)' }}>
                <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                    <div className="text-emerald-300 font-extrabold text-sm">Verified</div>
                    <div className="text-white/40 text-xs">Certified Experts</div>
                </div>
            </div>
            {/* Floating badge 2 */}
            <div ref={card2Ref} className="absolute -right-10 bottom-28 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10"
                style={{ background: 'rgba(232,121,249,0.12)', backdropFilter: 'blur(20px)' }}>
                <div className="w-9 h-9 bg-fuchsia-500/20 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-fuchsia-400 fill-fuchsia-400" />
                </div>
                <div>
                    <div className="text-fuchsia-300 font-extrabold text-sm">4.9 / 5.0</div>
                    <div className="text-white/40 text-xs">Patient Rating</div>
                </div>
            </div>
        </div>
    );
};
const DoctorMiniCard = ({ doc, delay }) => {
    const ref = useRef(null);
    useEffect(() => {
        gsap.from(ref.current, { opacity: 0, x: 30, duration: 0.6, delay: 0.6 + delay, ease: 'power2.out' });
    }, [delay]);
    return (
        <div
            ref={ref}
            className="flex items-center gap-4 p-4 rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-300 cursor-pointer group"
            style={{ background: 'rgba(255,255,255,0.04)' }}
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
                style={{ background: `${doc.color}30`, border: `1.5px solid ${doc.color}50` }}
            >
                {doc.img}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm truncate">{doc.name}</div>
                <div className="text-white/40 text-xs font-medium">{doc.spec}</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-white/70 text-xs font-bold">{doc.rating}</span>
            </div>
        </div>
    );
};
export default HeroSection;