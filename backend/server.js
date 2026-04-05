const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // MUST BE CALLED BEFORE REQUIRING OTHER MODULES THAT USE process.env
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
connectDB();
const app = express();
const corsOptions = {
    origin: [
        'https://appointy-healthcare.netlify.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Appointy API is running...');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
