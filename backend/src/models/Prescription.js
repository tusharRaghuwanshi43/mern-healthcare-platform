const mongoose = require('mongoose');
const prescriptionSchema = new mongoose.Schema({
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicines: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g., "1-0-1"
        duration: { type: String, required: true }, // e.g., "5 days"
        notes: { type: String }
    }],
    generalInstructions: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Prescription', prescriptionSchema);