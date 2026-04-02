const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialty: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    consultationFee: { type: Number, required: true },
    profilePhoto: { type: String, required: true },
    bio: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, default: '' },
    availability: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        slots: [{ type: String }] // e.g., "09:00 AM"
    }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    role: { type: String, default: 'doctor' },
    isEmailVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false } // Admin approval
}, { timestamps: true });
doctorSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
doctorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('Doctor', doctorSchema);