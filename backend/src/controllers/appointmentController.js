const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot } = req.body;
        const patientId = req.user._id;
        // Verify doctor exists and get fee
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        // Add validation to check if slot is already booked for this doctor on this date
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            status: { $nin: ['cancelled', 'rejected'] }
        });
        if (existingAppointment) {
            return res.status(400).json({ message: 'Time slot already booked' });
        }
        const appointment = await Appointment.create({
            patient: patientId,
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            consultationFee: doctor.consultationFee,
            status: 'pending',
            paymentStatus: 'pending'
        });
        res.status(201).json(appointment);
    } catch (error) {
        console.error("Create Appointment Error:", error);
        res.status(500).json({ message: 'Server error creating appointment' });
    }
};
// @desc    Get logged in patient's appointments
// @route   GET /api/appointments/myappointments
// @access  Private
const getMyAppointments = async (req, res) => {
    try {
        const patientId = req.user._id;
        const appointments = await Appointment.find({ patient: patientId })
            .populate('doctor', 'name specialty profilePhoto')
            .sort({ date: 1 }); // Sort by upcoming

        res.json(appointments);
    } catch (error) {
        console.error("Fetch Patient Appointments Error:", error);
        res.status(500).json({ message: 'Server error fetching appointments' });
    }
};
// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
const getDoctorAppointments = async (req, res) => {
    try {
        // Assuming doctor user's ID matches the Doctor schema _id.
        // If they are separate schemas, need to map User._id to Doctor._id or use email
        // Given our schema, Doctor is a completely separate model that logs in.
        const doctorId = req.user._id;

        const appointments = await Appointment.find({ doctor: doctorId })
            .populate('patient', 'name email profilePhoto age gender phone medicalNotes')
            .sort({ date: 1 });

        res.json(appointments);
    } catch (error) {
        console.error("Fetch Doctor Appointments Error:", error);
        res.status(500).json({ message: 'Server error fetching doctor appointments' });
    }
};
// @desc    Update appointment status (Accept/Reject)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Verify the doctor updating is the one assigned
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }
        appointment.status = status;
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        console.error("Update Appointment Status Error:", error);
        res.status(500).json({ message: 'Server error updating appointment status' });
    }
};
// @desc    Add a digital prescription to an appointment
// @route   POST /api/appointments/:id/prescription
// @access  Private (Doctor)
const addPrescription = async (req, res) => {
    try {
        const { medicines, generalInstructions } = req.body;
        const appointmentId = req.params.id;
        const doctorId = req.user._id;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.doctor.toString() !== doctorId.toString()) {
            return res.status(403).json({ message: 'Not authorized to add prescription for this appointment' });
        }
        const Prescription = require('../models/Prescription');
        // Check if prescription already exists for this appointment
        let prescription = await Prescription.findOne({ appointment: appointmentId });

        if (prescription) {
            // Update existing prescription
            prescription.medicines = medicines;
            prescription.generalInstructions = generalInstructions;
            await prescription.save();
        } else {
            // Create new prescription
            prescription = await Prescription.create({
                appointment: appointmentId,
                doctor: doctorId,
                patient: appointment.patient,
                medicines,
                generalInstructions
            });
            // Link to appointment
            appointment.prescription = prescription._id;
            appointment.status = 'completed'; // auto-complete appointment when prescription is given
            await appointment.save();
        }
        res.status(201).json(prescription);
    } catch (error) {
        console.error("Add Prescription Error:", error);
        res.status(500).json({ message: 'Server error adding prescription' });
    }
};
// @desc    Get prescription for an appointment
// @route   GET /api/appointments/:id/prescription
// @access  Private
const getPrescription = async (req, res) => {
    try {
        const Prescription = require('../models/Prescription');
        const prescription = await Prescription.findOne({ appointment: req.params.id })
            .populate('doctor', 'name specialty profilePhoto')
            .populate('patient', 'name');

        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

        // Ensure user is authorized (either the patient or the doctor)
        const patientId = prescription.patient?._id || prescription.patient;
        const doctorId = prescription.doctor?._id || prescription.doctor;
        if (patientId.toString() !== req.user._id.toString() && doctorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this prescription' });
        }
        res.json(prescription);
    } catch (error) {
        console.error("Get Prescription Error:", error);
        res.status(500).json({ message: 'Server error fetching prescription' });
    }
}
// @desc    Update appointment payment status to paid
// @route   PATCH /api/appointments/:id/pay
// @access  Private (Patient)
const updatePaymentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (appointment.patient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }
        appointment.paymentStatus = 'paid';
        await appointment.save();
        res.json({ message: 'Payment status updated securely', appointment });
    } catch (error) {
        console.error("Update Payment Status Error:", error);
        res.status(500).json({ message: 'Server error updating payment status' });
    }
};
module.exports = { createAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus, addPrescription, getPrescription, updatePaymentStatus };