const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail, googleAuth } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
router.post('/register', upload.single('profilePhoto'), registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyEmail);
router.post('/google', googleAuth);
module.exports = router;