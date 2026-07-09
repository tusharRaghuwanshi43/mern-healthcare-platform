// Automation Service — Reusable business logic for UiPath integration
// Controllers stay thin; all heavy lifting lives here.

const Appointment = require('../models/Appointment');

/**
 * Build a clean automation payload for UiPath from a populated appointment.
 * Strips sensitive data (passwords, tokens, medical records, payment secrets).
 */
const buildAppointmentAutomationPayload = (appointment) => {
    return {
        appointmentId: appointment._id,
        patientName: appointment.patient?.name || 'N/A',
        patientEmail: appointment.patient?.email || 'N/A',
        doctorName: appointment.doctor?.name || 'N/A',
        doctorEmail: appointment.doctor?.email || 'N/A',
        speciality: appointment.doctor?.specialty || 'N/A',
        date: appointment.date ? new Date(appointment.date).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }) : 'N/A',
        time: appointment.timeSlot || 'N/A',
        paymentStatus: appointment.paymentStatus === 'paid' ? 'Paid' : 'Pending',
        automationStatus: appointment.automation?.status || 'pending'
    };
};

/**
 * Queue an appointment for UiPath automation processing.
 * Fetches the appointment, validates required data, sets status to "queued".
 */
const queueAppointmentAutomation = async (appointmentId) => {
    const appointment = await Appointment.findById(appointmentId)
        .populate('patient', 'name email')
        .populate('doctor', 'name email specialty');

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // Validate required fields for automation
    const missingFields = [];
    if (!appointment.patient?.email) missingFields.push('patient email');
    if (!appointment.doctor?.email) missingFields.push('doctor email');
    if (!appointment.date) missingFields.push('appointment date');
    if (!appointment.timeSlot) missingFields.push('appointment time');

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields for automation: ${missingFields.join(', ')}`);
    }

    // Update automation status to queued
    appointment.automation.status = 'queued';
    await appointment.save();

    return appointment;
};

/**
 * Get upcoming appointments within a given time window.
 * Default: next 24 hours. UiPath polls this endpoint.
 */
const getUpcomingAppointments = async (hours = 24) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const appointments = await Appointment.find({
        date: { $gte: now, $lte: cutoff },
        status: { $in: ['pending', 'confirmed'] }
    })
        .populate('patient', 'name email')
        .populate('doctor', 'name email specialty')
        .sort({ date: 1 });

    return appointments;
};

/**
 * Update the automation status after UiPath finishes processing.
 * Sets lastProcessedAt timestamp on completion or failure.
 */
const updateAppointmentAutomationStatus = async (appointmentId, data) => {
    const { status, reminderSent, doctorNotificationSent, errorMessage } = data;

    const validStatuses = ['pending', 'queued', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // Update only automation-related fields
    appointment.automation.status = status;
    if (typeof reminderSent === 'boolean') appointment.automation.reminderSent = reminderSent;
    if (typeof doctorNotificationSent === 'boolean') appointment.automation.doctorNotificationSent = doctorNotificationSent;
    if (typeof errorMessage === 'string') appointment.automation.errorMessage = errorMessage;

    // Set lastProcessedAt when completed or failed
    if (status === 'completed' || status === 'failed') {
        appointment.automation.lastProcessedAt = new Date();
    }

    await appointment.save();

    return appointment.automation;
};

module.exports = {
    buildAppointmentAutomationPayload,
    queueAppointmentAutomation,
    getUpcomingAppointments,
    updateAppointmentAutomationStatus
};
