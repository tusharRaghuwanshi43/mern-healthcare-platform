import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ShieldCheck, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
// Public Stripe key for test mode
const stripePromise = loadStripe('pk_test_51SDVBPJFeSEk5i38YfMBBQeK4SuNBL4xRz4Cs4Dr8CXuawWGhTJ4eJGgEqyOuqrMEIcQykKhpVYSBjNOYOmj9NE000Nf8Sopqg');
const CheckoutForm = ({ amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;
        setIsProcessing(true);
        setError(null);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/patient/dashboard`,
            },
            redirect: 'if_required' // For SPA flow without full redirect if possible
        });
        if (error) {
            setError(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        }
        setIsProcessing(false);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <PaymentElement />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-bold">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <button
                disabled={isProcessing || !stripe || !elements}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold py-4 px-8 rounded-2xl shadow-lg shadow-primary-500/30 transition-all flex justify-center items-center transform hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:shadow-none"
            >
                {isProcessing ? (
                    <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <span className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Pay ${amount} Securely
                    </span>
                )}
            </button>
            <p className="text-center text-xs font-bold text-slate-400 mt-4 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Payments are processed securely by Stripe
            </p>
        </form>
    );
};
const PaymentGateway = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState("");
    const { userInfo } = useSelector((state) => state.auth);

    // Safely fallback if state is missing
    const paymentData = location.state || { amount: 150 };
    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        const createPaymentIntent = async () => {
            if (!userInfo) return;
            try {
                const { data } = await axios.post('http://localhost:5000/api/payments/create-intent', {
                    amount: paymentData.amount
                }, {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                });
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error("Failed to initialize payment", err);
            }
        };
        createPaymentIntent();
    }, [paymentData.amount, userInfo]);
    const handlePaymentSuccess = async (paymentId) => {
        if (paymentData.appointmentId && userInfo?.token) {
            try {
                await axios.patch(`http://localhost:5000/api/appointments/${paymentData.appointmentId}/pay`, {}, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
            } catch (error) {
                console.error("Failed to sync successful payment with backend:", error);
            }
        }
        // Navigate back to the dashboard securely
        navigate('/patient/dashboard', { state: { paymentSuccess: true, paymentId } });
    };
    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#8b5cf6', // Indigo-500 matching the Applox primary theme
            colorBackground: '#ffffff',
            colorText: '#1e293b',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '16px',
            spacingUnit: '5px',
            gridRowSpacing: '16px',
        },
        rules: {
            '.Input': { border: '1px solid #e2e8f0', boxShadow: 'none' },
            '.Input:focus': { border: '2px solid #c4b5fd', boxShadow: '0 0 0 4px #ede9fe' },
        }
    };
    return (
        <div className="bg-slate-50 min-h-screen pt-8 pb-12 font-sans text-slate-900 relative flex items-center justify-center">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mx-auto px-4 relative z-10"
            >
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-white">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary-100 transform rotate-3">
                            <ShieldCheck className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Complete Checkout</h1>
                        <p className="text-slate-500 font-medium mt-2">Almost there! Finalize your booking securely.</p>
                    </div>

                    <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-6 rounded-[1.5rem] mb-8 flex justify-between items-center text-white shadow-lg shadow-primary-500/20 transform hover:scale-[1.02] transition-transform">
                        <div>
                            <span className="text-primary-100 font-extrabold text-xs uppercase tracking-widest block mb-1">Total Amount Due</span>
                            <span className="text-4xl font-black">${paymentData.amount}</span>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="relative">
                        {clientSecret ? (
                            <div className="animate-fade-in-up">
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                                    <CheckoutForm amount={paymentData.amount} onSuccess={handlePaymentSuccess} />
                                </Elements>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                <p className="text-sm font-bold text-slate-400 animate-pulse">Initializing Secure Connection...</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
// Simple AnimatePresence fallback if not imported correctly at top
const AnimatePresence = ({ children }) => <>{children}</>;
export default PaymentGateway;