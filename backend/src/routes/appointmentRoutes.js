const express = require('express');
const router = express.Router();
const { createAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus, addPrescription, getPrescription, updatePaymentStatus } = require('../controllers/appointmentController');
const { protect, doctor } = require('../middleware/authMiddleware');
router.post('/book', protect, createAppointment);
router.get('/myappointments', protect, getMyAppointments);
router.get('/doctor', protect, doctor, getDoctorAppointments);
router.patch('/:id/status', protect, doctor, updateAppointmentStatus);
router.patch('/:id/pay', protect, updatePaymentStatus);
// Prescriptions Routes
router.route('/:id/prescription')
    .post(protect, doctor, addPrescription)
    .get(protect, getPrescription);
module.exports = router;