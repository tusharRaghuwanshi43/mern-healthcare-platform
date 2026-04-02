const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "10:00 - 10:30"
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paymentId: { type: String }, // Stripe or Razorpay ID
    consultationFee: { type: Number, required: true },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
}, { timestamps: true });
module.exports = mongoose.model('Appointment', appointmentSchema);