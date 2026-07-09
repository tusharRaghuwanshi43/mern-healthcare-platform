// Automation Controller — Thin layer over automationService
// All business logic lives in services/automationService.js

const { GoogleGenAI } = require('@google/genai');
const {
    buildAppointmentAutomationPayload,
    queueAppointmentAutomation,
    getUpcomingAppointments,
    updateAppointmentAutomationStatus
} = require('../services/automationService');

// @desc    Create automation job after appointment booking
// @route   POST /api/automation/appointment-created
// @access  UiPath API Key
const appointmentCreated = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            return res.status(400).json({ success: false, message: 'appointmentId is required' });
        }

        const appointment = await queueAppointmentAutomation(appointmentId);
        const payload = buildAppointmentAutomationPayload(appointment);

        res.status(200).json({
            success: true,
            message: 'Appointment automation job created',
            appointment: payload
        });
    } catch (error) {
        console.error('Automation - Appointment Created Error:', error.message);
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get upcoming appointments for UiPath to process
// @route   GET /api/automation/upcoming-appointments
// @access  UiPath API Key
const upcomingAppointments = async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        if (hours < 1 || hours > 168) {
            return res.status(400).json({ success: false, message: 'hours must be between 1 and 168' });
        }

        const appointments = await getUpcomingAppointments(hours);
        const payload = appointments.map(buildAppointmentAutomationPayload);

        res.status(200).json({
            success: true,
            count: payload.length,
            appointments: payload
        });
    } catch (error) {
        console.error('Automation - Upcoming Appointments Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming appointments' });
    }
};

// @desc    UiPath updates automation status after processing
// @route   PATCH /api/automation/:appointmentId/status
// @access  UiPath API Key
const updateStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, reminderSent, doctorNotificationSent, errorMessage } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'status is required' });
        }

        const automation = await updateAppointmentAutomationStatus(appointmentId, {
            status,
            reminderSent,
            doctorNotificationSent,
            errorMessage
        });

        res.status(200).json({
            success: true,
            message: 'Automation status updated',
            automation
        });
    } catch (error) {
        console.error('Automation - Update Status Error:', error.message);
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Generate AI appointment reminder using existing Gemini setup
// @route   POST /api/automation/generate-reminder
// @access  UiPath API Key
const generateReminder = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            return res.status(400).json({ success: false, message: 'appointmentId is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'AI service is currently unavailable.' });
        }

        const Appointment = require('../models/Appointment');
        const appointment = await Appointment.findById(appointmentId)
            .populate('patient', 'name email')
            .populate('doctor', 'name email specialty');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const patientName = appointment.patient?.name || 'Patient';
        const doctorName = appointment.doctor?.name || 'Doctor';
        const speciality = appointment.doctor?.specialty || 'Specialist';
        const date = appointment.date
            ? new Date(appointment.date).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })
            : 'Scheduled Date';
        const time = appointment.timeSlot || 'Scheduled Time';

        const prompt = `
        Create a short professional appointment reminder for a healthcare platform.
        Patient: ${patientName}
        Doctor: ${doctorName}
        Speciality: ${speciality}
        Date: ${date}
        Time: ${time}
        Rules:
        - Maximum 80 words.
        - Do not give medical advice, diagnosis, treatment, medication guidance, or urgency assessment.
        - Keep the message polite and clear.
        - Return only the reminder message text, nothing else.
        `;

        // Reuse the same Gemini pattern from aiController.js
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        const message = response.text?.trim() || 'Your appointment is coming up soon. Please arrive on time.';

        res.status(200).json({
            success: true,
            subject: 'Appointment Reminder',
            message
        });
    } catch (error) {
        console.error('Automation - Generate Reminder Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to generate reminder' });
    }
};

module.exports = { appointmentCreated, upcomingAppointments, updateStatus, generateReminder };
