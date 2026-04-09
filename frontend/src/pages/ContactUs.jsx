import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Send, ShieldCheck, FileText, ChevronDown, AlertTriangle, Clock, X, HeartPulse } from 'lucide-react';
import Navbar from '../components/Navbar';

const ContactUs = () => {
    const [activeModal, setActiveModal] = useState(null);
    return (
        <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* HER SECTION */}
            <section className="relative pt-32 pb-20 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2557 45%, #1e40af 100%)' }}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-teal-400 font-bold uppercase tracking-widest text-sm block mb-4">We're Here to Help</span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-300">Appointy</span></h1>
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            Have questions about our platform? Need support with an appointment? Our team is available 24/7.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="py-16 lg:py-10 max-w-7xl mx-auto px-6 lg:px-8 relative z-20 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LEFT COL: Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-8">Get In Touch</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                                        <p className="text-lg font-bold text-slate-800">+1 (800) 123-4567</p>
                                        <p className="text-sm text-slate-500">Mon-Fri, 9am - 6pm EST</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                        <p className="text-lg font-bold text-slate-800">support@appointy.com</p>
                                        <p className="text-sm text-slate-500">We aim to reply in 24hrs</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Office</p>
                                        <p className="text-lg font-bold text-slate-800">123 Health Ave, Suite 400</p>
                                        <p className="text-sm text-slate-500">New York, NY 10001</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Emergency Card added to fill empty space */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-red-50 rounded-3xl p-6 border border-red-100 relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <h4 className="text-xl font-black text-red-900">Medical Emergency?</h4>
                            </div>
                            <p className="text-sm font-medium text-red-800/80 mb-4 tracking-wide leading-relaxed">
                                Our platform is not for emergencies. If you are experiencing a life-threatening crisis, don't wait.
                            </p>
                            <button className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                <Phone className="w-4 h-4" />
                                Call 911 Immediately
                            </button>
                        </motion.div>
                    </div>

                    {/* RIGHT COL: Contact Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
                        >
                            <h3 className="text-3xl font-black text-slate-900 mb-2">Send us a Message</h3>
                            <p className="text-slate-500 mb-8 font-medium">Fill out the form below and we'll get back to you as soon as possible.</p>

                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for your message! Our team will contact you shortly."); }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">First Name</label>
                                        <input type="text" required className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Last Name</label>
                                        <input type="text" required className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                                    <input type="email" required className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">How can we help?</label>
                                    <textarea required rows="4" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none" placeholder="Tell us about your issue or question..."></textarea>
                                </div>
                                <button type="submit" className="w-full md:w-auto px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5">
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* LEGAL & POLICIES SECTION */}
            <section className="py-16 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Legal & Policies</h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">We believe in complete transparency. Read our policies to understand how we protect your data and rights.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-all"
                        >
                            <div className="w-14 h-14 bg-white text-blue-600 shadow-sm rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy Policy</h3>
                            <p className="text-slate-600 leading-relaxed font-medium mb-6">
                                Your data privacy is our top priority. Appointy complies with HIPAA standards, ensuring that your medical records and personal data are fully encrypted and only accessible by authorized care partners.
                            </p>
                            <button onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} className="text-blue-700 font-bold flex items-center gap-1 hover:text-blue-900 transition-colors bg-blue-50/50 hover:bg-blue-100/50 px-3 py-1.5 rounded-lg -ml-3">
                                Read Full Privacy Policy <ChevronDown className="w-4 h-4 -rotate-90" />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-all"
                        >
                            <div className="w-14 h-14 bg-white text-teal-600 shadow-sm rounded-2xl flex items-center justify-center mb-6">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Terms & Conditions</h3>
                            <p className="text-slate-600 leading-relaxed font-medium mb-6">
                                By using Appointy, you agree to our standard terms of service. This includes our cancellation policies, appointment booking guidelines, and platform usage rules designed to protect both patients and doctors.
                            </p>
                            <button onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} className="text-teal-700 font-bold flex items-center gap-1 hover:text-teal-900 transition-colors bg-teal-50/50 hover:bg-teal-100/50 px-3 py-1.5 rounded-lg -ml-3">
                                Read Terms & Conditions <ChevronDown className="w-4 h-4 -rotate-90" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* MODALS */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-2xl h-[85vh] lg:h-[75vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 pointer-events-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${activeModal === 'privacy' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'}`}>
                                        {activeModal === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">
                                        {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 md:p-8 overflow-y-auto flex-grow text-slate-600 outline-none">
                                <div className="prose prose-slate max-w-none">
                                    {activeModal === 'privacy' ? (
                                        <div className="space-y-6">
                                            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Last Updated: April 2026</p>
                                            <p className="text-lg text-slate-700 font-medium leading-relaxed">At Appointy, your privacy and data security are our top priorities. This Privacy Policy details the types of information we collect, how it is used, and the measures we take to protect your data in compliance with the Health Insurance Portability and Accountability Act (HIPAA).</p>

                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <h4 className="font-black text-slate-800 text-xl flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm flex items-center justify-center">1</span> Information Collection</h4>
                                                <p className="leading-relaxed">We may collect personally identifiable information such as your name, contact details, demographic information, and highly sensitive health data, including medical history, symptoms, and consultation notes when you book appointments or interact with Care Partners through our platform.</p>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <h4 className="font-black text-slate-800 text-xl flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm flex items-center justify-center">2</span> Data Security & Encryption</h4>
                                                <p className="leading-relaxed">Appointy employs bank-grade, end-to-end encryption protocols (AES-256) for all data stored and transmitted through our cloud infrastructure. Access to your personal health records is strictly gated via rigorous authentication processes.</p>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-100 pb-8">
                                                <h4 className="font-black text-slate-800 text-xl flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm flex items-center justify-center">3</span> Third-Party Sharing</h4>
                                                <p className="leading-relaxed">We absolutely do not sell your personal health information to any third-party advertisers. Data is exclusively shared with your matched Care Partners for the sole purpose of clinical evaluation and treatment.</p>
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4 leading-relaxed font-medium text-blue-800">
                                                    By using our services, you consent to this policy. If you have inquiries about our data practices or wish to request data deletion, please reach out via our contact channels.
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Last Updated: April 2026</p>
                                            <p className="text-lg text-slate-700 font-medium leading-relaxed">Welcome to Appointy. These Terms of Service outline the rules, guidelines, and obligations for patients and Care Partners using our digital healthcare platform.</p>

                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <h4 className="font-black text-slate-800 text-xl flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm flex items-center justify-center">1</span> User Obligations</h4>
                                                <p className="leading-relaxed">You agree to provide true, accurate, and complete information during registration and appointment booking. Fraudulent accounts or the misuse of the platform to disseminate false medical advice is an immediate grounds for termination.</p>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <h4 className="font-black text-slate-800 text-xl flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm flex items-center justify-center">2</span> Medical Disclaimer</h4>
                                                <p className="leading-relaxed">Appointy provides the infrastructure for you to connect with medical professionals. However, Appointy itself does not offer direct medical advice or diagnoses. For extreme medical emergencies, do not use Appointy; contact your local emergency services immediately.</p>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-100 pb-8">
                                                <h4 className="font-black text-slate-800 text-xl flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm flex items-center justify-center">3</span> Payments and Cancellations</h4>
                                                <p className="leading-relaxed">All payments are processed securely via Stripe. Consultations can be cancelled up to 2 hours prior to the scheduled start time for a full refund. Cancellations made beyond this window may incur a nominal fee compensating the Care Partner's scheduled time.</p>
                                                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mt-4 leading-relaxed font-medium text-teal-800">
                                                    By continuing to use Appointy, you acknowledge that you have read, understood, and agreed to adhere to these terms.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg"
                                >
                                    I Understand
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContactUs;
