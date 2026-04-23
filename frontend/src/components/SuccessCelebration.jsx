import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

// Confetti particle component
const Particle = ({ delay, x, color, size }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: size, height: size, backgroundColor: color, left: `${x}%`, top: '50%' }}
        initial={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        animate={{
            opacity: [1, 1, 0],
            y: [0, -Math.random() * 300 - 100, -Math.random() * 500 - 200],
            x: [0, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 500],
            scale: [1, 1.2, 0.3],
            rotate: [0, Math.random() * 720 - 360],
        }}
        transition={{ duration: 2.2, delay, ease: 'easeOut' }}
    />
);

// Ring burst animation
const RingBurst = () => (
    <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.2, delay: 0.1 }}
    >
        <motion.div
            className="rounded-full border-4 border-green-400"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />
    </motion.div>
);

const PARTICLE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
const PARTICLE_COUNT = 40;

const SuccessCelebration = ({
    show,
    onClose,
    title = 'Success!',
    message = 'Your action was completed successfully.',
    icon: CustomIcon,
    buttonText = 'Continue',
    autoCloseMs = 0,
    variant = 'default' // 'default' | 'payment' | 'booking' | 'account'
}) => {
    const [particles] = useState(() =>
        Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
            id: i,
            delay: Math.random() * 0.5,
            x: 30 + Math.random() * 40,
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
            size: Math.random() * 8 + 4,
        }))
    );

    const handleClose = useCallback(() => {
        if (onClose) onClose();
    }, [onClose]);

    useEffect(() => {
        if (show && autoCloseMs > 0) {
            const timer = setTimeout(handleClose, autoCloseMs);
            return () => clearTimeout(timer);
        }
    }, [show, autoCloseMs, handleClose]);

    // Variant-specific styling
    const variantStyles = {
        default: { gradient: 'from-primary-500 to-blue-600', iconBg: 'bg-green-500', ring: 'ring-green-200' },
        payment: { gradient: 'from-green-500 to-emerald-600', iconBg: 'bg-green-500', ring: 'ring-green-200' },
        booking: { gradient: 'from-primary-500 to-indigo-600', iconBg: 'bg-primary-500', ring: 'ring-primary-200' },
        account: { gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-500', ring: 'ring-violet-200' },
    };
    const style = variantStyles[variant] || variantStyles.default;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Confetti particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {particles.map(p => (
                            <Particle key={p.id} {...p} />
                        ))}
                    </div>

                    <RingBurst />

                    {/* Main card */}
                    <motion.div
                        className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden"
                        initial={{ opacity: 0, scale: 0.5, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
                    >
                        {/* Gradient header stripe */}
                        <div className={`h-2 bg-gradient-to-r ${style.gradient}`} />

                        <div className="p-8 text-center">
                            {/* Animated checkmark icon */}
                            <motion.div
                                className="mx-auto mb-6 relative"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }}
                            >
                                <div className={`w-20 h-20 ${style.iconBg} rounded-full flex items-center justify-center mx-auto shadow-lg ring-8 ${style.ring} ring-opacity-50`}>
                                    {CustomIcon ? (
                                        <CustomIcon className="w-10 h-10 text-white" />
                                    ) : (
                                        <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                                    )}
                                </div>
                                {/* Sparkle accents */}
                                <motion.div
                                    className="absolute -top-2 -right-2"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7, type: 'spring' }}
                                >
                                    <Sparkles className="w-6 h-6 text-amber-400" />
                                </motion.div>
                                <motion.div
                                    className="absolute -bottom-1 -left-3"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9, type: 'spring' }}
                                >
                                    <Sparkles className="w-5 h-5 text-primary-400" />
                                </motion.div>
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                            >
                                {title}
                            </motion.h2>

                            {/* Message */}
                            <motion.p
                                className="text-sm font-medium text-slate-500 leading-relaxed mb-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                            >
                                {message}
                            </motion.p>

                            {/* CTA Button */}
                            <motion.button
                                onClick={handleClose}
                                className={`w-full bg-gradient-to-r ${style.gradient} text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.65 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {buttonText}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessCelebration;
