const express = require('express');
const router = express.Router();
const { uipathAuth } = require('../middleware/uipathAuth');
const {
    appointmentCreated,
    upcomingAppointments,
    updateStatus,
    generateReminder
} = require('../controllers/automationController');

// All automation routes are protected by UiPath API key
router.use(uipathAuth);

router.post('/appointment-created', appointmentCreated);
router.get('/upcoming-appointments', upcomingAppointments);
router.patch('/:appointmentId/status', updateStatus);
router.post('/generate-reminder', generateReminder);

module.exports = router;
