const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Connect to database ONCE (Render is not serverless)
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        'https://mern-healthcare-platform.onrender.com/',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Appointy API is running...');
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/doctors', require('./src/routes/doctorRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));

// Start server (REQUIRED for Render)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
