const User = require('../models/User');
const Doctor = require('../models/Doctor');
const sendEmail = require('../utils/sendEmail');
const dotenv = require('dotenv');
dotenv.config();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
// @desc    Register a new user (Patient by default)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, age, gender, phone, address, medicalNotes } = req.body;
        const profilePhoto = req.file ? req.file.path : '';
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const userRole = (role === 'doctor') ? 'doctor' : 'patient';
        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            age,
            gender,
            phone,
            address,
            medicalNotes,
            profilePhoto
        });
        if (user) {
            // Mocking email verification
            const verifyToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173';
            const verifyUrl = `${frontendUrl}/verify-email/${verifyToken}`;

            // console.log(`[Mock Email] Please verify your email by clicking: ${verifyUrl}`);
            // Send real email
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify Your Appointy Account',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: #0f172a; text-align: center;">Welcome to Appointy!</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Thank you for joining our secure healthcare network. Please verify your email address to complete your registration and access your dashboard.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                            </div>
                            <p style="color: #94a3b8; font-size: 12px; text-align: center;">This link will expire in 15 minutes. If you did not create an account, please ignore this email.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error("Email delivery failed:", emailError);
                // We still created the user, they can retry verification via login later if we implement Resend
            }
            res.status(201).json({
                message: 'Verification email sent. Please check your inbox.',
                email: user.email
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            if (!user.isEmailVerified) {
                return res.status(403).json({ message: 'Your account is awaiting email verification. Please check your inbox for the activation link.' });
            }
            const token = generateToken(res, user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Verify user email
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

        // Try finding in User collection first
        let account = await User.findById(decoded.userId);
        if (!account) {
            // Try finding in Doctor collection
            account = await Doctor.findById(decoded.userId);
        }
        if (!account) {
            return res.status(400).json({ message: 'Invalid token - account not found' });
        }

        // --- UPDATE #1: Add alreadyVerified flag ---
        if (account.isEmailVerified) {
            return res.status(200).json({
                message: 'Email already verified',
                alreadyVerified: true // Let the frontend know definitively
            });
        }

        account.isEmailVerified = true;
        // Also set isVerified for Doctors to ensure access
        if (account.role === 'doctor') {
            account.isVerified = true;
        }
        await account.save();

        // --- UPDATE #2: Add alreadyVerified flag ---
        res.json({
            message: 'Email verified successfully! You can now login.',
            alreadyVerified: false // First time verification
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};
// @desc    Google SignIn/SignUp
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { idToken, role } = req.body;
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        let user = await User.findOne({ email });
        if (!user) {
            // First time Google Sign in -> Register them
            const userRole = (role === 'doctor' || role === 'patient') ? role : 'patient';
            user = await User.create({
                name,
                email,
                googleId,
                role: userRole,
                isEmailVerified: true // Google emails are already verified
            });
        }
        // Return login token
        const token = generateToken(res, user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: 'Invalid Google Token' });
    }
};
module.exports = { registerUser, loginUser, verifyEmail, googleAuth };