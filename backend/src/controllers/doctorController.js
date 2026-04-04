const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
// @desc    Register a new doctor
// @route   POST /api/doctors/signup
// @access  Public
const registerDoctor = async (req, res) => {
    try {
        const { name, email, password, specialty, experienceYears, consultationFee, bio, address, availability } = req.body;

        // Handle image upload from Cloudinary middleware
        const profilePhoto = req.file ? req.file.path : 'https://via.placeholder.com/150';
        const doctorExists = await Doctor.findOne({ email });
        if (doctorExists) {
            return res.status(400).json({ message: 'Doctor already exists' });
        }
        // Parse availability if it comes as a JSON string from FormData
        let parsedAvailability = [];
        if (availability) {
            parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
        }
        const doctor = await Doctor.create({
            name,
            email,
            password,
            specialty,
            experienceYears: Number(experienceYears),
            consultationFee: Number(consultationFee),
            profilePhoto,
            bio,
            address,
            availability: parsedAvailability
        });
        if (doctor) {
            // Mocking email verification for doctors
            const verifyToken = jwt.sign({ userId: doctor._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const verifyUrl = `http://localhost:5173/verify-email/${verifyToken}`;

            // console.log(`[Mock Email] Provider Verification Link: ${verifyUrl}`);
            // Send real email
            try {
                await sendEmail({
                    email: doctor.email,
                    subject: 'Verify Your Care Partner Account - Appointy',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: #0f172a; text-align: center;">Welcome to Appointy Provider Network!</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Dr. ${doctor.name},</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Thank you for joining our network of top-rated healthcare professionals. Please verify your professional email address to activate your provider dashboard.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verifyUrl}" style="background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Activate Provider Account</a>
                            </div>
                            <p style="color: #64748b; font-size: 14px;">Once verified, our administrators will review your credentials for final approval.</p>
                            <p style="color: #94a3b8; font-size: 12px; text-align: center;">This activation link will expire in 15 minutes.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error("Doctor email delivery failed:", emailError);
            }
            res.status(201).json({
                message: 'Verification email sent. Please check your inbox.',
                email: doctor.email
            });
        } else {
            res.status(400).json({ message: 'Invalid doctor data' });
        }
    } catch (error) {
        console.error("Doctor Signup Error:", error);
        res.status(500).json({ message: error.message || 'Server error during signup' });
    }
};
// @desc    Auth Doctor & get token
// @route   POST /api/doctors/signin
// @access  Public
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await Doctor.findOne({ email });
        if (doctor && (await doctor.matchPassword(password))) {
            if (!doctor.isEmailVerified && !doctor.isVerified) {
                return res.status(403).json({ message: 'Your account is awaiting email verification. Please check your inbox for the activation link.' });
            }
            res.json({
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                role: doctor.role,
                profilePhoto: doctor.profilePhoto,
                token: generateToken(res, doctor._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public (or protected depending on design, currently making it public for search)
const getDoctors = async (req, res) => {
    try {
        // Aggregate real review stats from the Review collection so the
        // counts always reflect the actual database rather than the seeded field.
        const doctors = await Doctor.aggregate([
            { $match: {} },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'doctor',
                    as: 'reviewDocs'
                }
            },
            {
                $addFields: {
                    totalReviews: { $size: '$reviewDocs' },
                    averageRating: {
                        $cond: [
                            { $gt: [{ $size: '$reviewDocs' }, 0] },
                            { $round: [{ $avg: '$reviewDocs.rating' }, 1] },
                            0
                        ]
                    },
                    recentReviews: { $slice: ['$reviewDocs', 3] }
                }
            },
            { $project: { password: 0, reviewDocs: 0 } }
        ]);
        res.json(doctors);
    } catch (error) {
        console.error("Fetch Doctors Error:", error);
        res.status(500).json({ message: 'Server Error fetching doctors' });
    }
};
// @desc    Get current doctor profile
// @route   GET /api/doctors/me
// @access  Private (Doctor)
const getDoctorProfile = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const doctor = await Doctor.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'doctor',
                    as: 'reviewDocs'
                }
            },
            {
                $addFields: {
                    totalReviews: { $size: '$reviewDocs' },
                    averageRating: {
                        $cond: [
                            { $gt: [{ $size: '$reviewDocs' }, 0] },
                            { $round: [{ $avg: '$reviewDocs.rating' }, 1] },
                            0
                        ]
                    }
                }
            },
            {
                $project: { password: 0 }
            }
        ]);
        if (doctor && doctor.length > 0) {
            res.json(doctor[0]);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        console.error("Fetch Doctor Profile Error:", error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};
// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor)
const updateDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user._id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        // Required/Strict formatting checks
        if (req.body.name && req.body.name.trim() !== "") doctor.name = req.body.name;
        if (req.body.specialty && req.body.specialty.trim() !== "") doctor.specialty = req.body.specialty;

        // Optional Fields (allowing clearing)
        if (req.body.bio !== undefined) doctor.bio = req.body.bio;
        if (req.body.address !== undefined) doctor.address = req.body.address;
        if (req.body.phone !== undefined) doctor.phone = req.body.phone;

        // Numeric handling
        if (req.body.experienceYears !== undefined && req.body.experienceYears !== "") {
            doctor.experienceYears = Number(req.body.experienceYears);
        }
        if (req.body.consultationFee !== undefined && req.body.consultationFee !== "") {
            doctor.consultationFee = Number(req.body.consultationFee);
        }
        // Object/Array parsing
        if (req.body.availability) {
            try {
                doctor.availability = typeof req.body.availability === 'string' ? JSON.parse(req.body.availability) : req.body.availability;
            } catch (e) {
                console.error("Failed to parse availability", e);
            }
        }
        // Photo Upload from Multer/Cloudinary
        if (req.file) {
            doctor.profilePhoto = req.file.path;
        } else if (req.body.profilePhoto !== undefined) {
            doctor.profilePhoto = req.body.profilePhoto;
        }
        const updatedDoctor = await doctor.save();
        res.json({
            _id: updatedDoctor._id,
            name: updatedDoctor.name,
            email: updatedDoctor.email,
            specialty: updatedDoctor.specialty,
            experienceYears: updatedDoctor.experienceYears,
            consultationFee: updatedDoctor.consultationFee,
            profilePhoto: updatedDoctor.profilePhoto,
            bio: updatedDoctor.bio,
            address: updatedDoctor.address,
            phone: updatedDoctor.phone,
            averageRating: updatedDoctor.averageRating,
            totalReviews: updatedDoctor.totalReviews
        });
    } catch (error) {
        console.error("Update Doctor Profile Error:", error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
// @desc    Add a review to a doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private (Patient)
const addDoctorReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const doctorId = req.params.id;
        const patientId = req.user._id;
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        const Review = require('../models/Review');

        // Ensure patient has not already reviewed this doctor
        const alreadyReviewed = await Review.findOne({ doctor: doctorId, patient: patientId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Doctor already reviewed' });
        }
        const Appointment = require('../models/Appointment');
        const hasCompletedAppointment = await Appointment.findOne({ patient: patientId, doctor: doctorId, status: 'completed' });
        if (!hasCompletedAppointment) {
            return res.status(403).json({ message: 'You can only review a doctor after a completed consultation.' });
        }
        const review = await Review.create({
            doctor: doctorId,
            patient: patientId,
            rating: Number(rating),
            comment
        });
        // Recalculate average rating
        const allReviews = await Review.find({ doctor: doctorId });
        const numReviews = allReviews.length;
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;
        doctor.averageRating = Math.round(avgRating * 10) / 10;
        doctor.totalReviews = numReviews;
        await doctor.save();
        res.status(201).json({ message: 'Review added', review });
    } catch (error) {
        console.error("Add Doctor Review Error:", error);
        res.status(500).json({ message: 'Server error adding review' });
    }
};
// @desc    Get reviews for a doctor
// @route   GET /api/doctors/:id/reviews
// @access  Public
const getDoctorReviews = async (req, res) => {
    try {
        const Review = require('../models/Review');
        const reviews = await Review.find({ doctor: req.params.id })
            .populate('patient', 'name profilePhoto')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error("Fetch Doctor Reviews Error:", error);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
};
// @desc    Get all high-rated reviews across all doctors
// @route   GET /api/doctors/reviews/all
// @access  Public
const getAllReviews = async (req, res) => {
    try {
        const Review = require('../models/Review');
        const reviews = await Review.find({ rating: { $gte: 4 } })
            .populate('patient', 'name profilePhoto')
            .populate('doctor', 'name specialty')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(reviews);
    } catch (error) {
        console.error("Fetch All Reviews Error:", error);
        res.status(500).json({ message: 'Server error fetching landing reviews' });
    }
};
// @desc    Like or unlike a review
// @route   PUT /api/doctors/reviews/:id/like
// @access  Private (Patient/User)
const likeReview = async (req, res) => {
    try {
        const Review = require('../models/Review');
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        const userId = req.user._id.toString();
        const index = review.likes.findIndex(id => id.toString() === userId);

        if (index === -1) {
            // Like
            review.likes.push(req.user._id);
        } else {
            // Unlike
            review.likes.splice(index, 1);
        }
        await review.save();
        res.json(review.likes);
    } catch (error) {
        console.error("Like Review Error:", error);
        res.status(500).json({ message: 'Server error updating like status' });
    }
};
// @desc    Delete doctor profile
// @route   DELETE /api/doctors/me
// @access  Private/Doctor
const deleteDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.user._id);
        if (doctor) {
            res.json({ message: 'Doctor account deleted successfully' });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        console.error("Delete Doctor Profile Error:", error);
        res.status(500).json({ message: 'Server error deleting profile' });
    }
};
// @desc    Get a single doctor by ID (public)
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('-password');
        if (doctor) {
            res.status(200).json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        console.error('Get Doctor By ID Error:', error);
        res.status(500).json({ message: 'Server error fetching doctor' });
    }
};
module.exports = {
    registerDoctor,
    loginDoctor,
    getDoctors,
    getDoctorById,
    getDoctorProfile,
    updateDoctorProfile,
    deleteDoctorProfile,
    addDoctorReview,
    getDoctorReviews,
    getAllReviews,
    likeReview
};