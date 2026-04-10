import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import DoctorSignup from './pages/DoctorSignup';
import DoctorLogin from './pages/DoctorLogin';
import Landing from './pages/Landing';
import PatientDashboard from './pages/PatientDashboard';
import DoctorSearch from './pages/DoctorSearch';
import AppointmentBooking from './pages/AppointmentBooking';
import PaymentGateway from './pages/PaymentGateway';
import DoctorDashboard from './pages/DoctorDashboard';
import VerifyEmail from './pages/VerifyEmail';
import ContactUs from './pages/ContactUs';

// Components
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

const AppContent = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const navHeight = 64;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: elementPosition - navHeight, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  const isDashboard = location.pathname.includes('dashboard');
  const isLanding = location.pathname === '/';

  return (
    <>
      {/* Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Main Layout */}
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 transition-colors duration-300">
        <Navbar />

        <main
          className={`flex-grow flex flex-col relative ${!isDashboard && !isLanding ? 'pt-16' : ''
            }`}
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/doctors" element={<DoctorSearch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/doctor/signup" element={<DoctorSignup />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/book/:doctorId" element={<AppointmentBooking />} />
            <Route path="/checkout" element={<PaymentGateway />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </main>
      </div>

      {/* Global AI Chatbot */}
      <Chatbot />
    </>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;