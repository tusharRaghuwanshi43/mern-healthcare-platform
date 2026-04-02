import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';

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

// Components
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

const AppContent = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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
    <GoogleOAuthProvider clientId="352555724788-f7bd9mhi7vj19lv5014sujvkjgpuaan9.apps.googleusercontent.com">
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;