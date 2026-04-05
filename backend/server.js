const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env variables FIRST
dotenv.config();

const app = express();

// 🔁 Handle DB connection safely for serverless
let isConnected = false;
const connectDatabase = async () => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
        console.log("MongoDB connected");
    }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    await connectDatabase();
    next();
});

// CORS config
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
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Appointy API is running...');
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/doctors', require('./src/routes/doctorRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));

// ✅ LOCAL ONLY: run server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// ❗ IMPORTANT: DO NOT use app.listen() in Vercel
module.exports = app;