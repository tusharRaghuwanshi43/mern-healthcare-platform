const nodemailer = require('nodemailer');
const sendEmail = async ({ email, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        const mailOptions = {
            from: `"Appointy Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: subject,
            html: html,
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Email send failed:', error);
        throw new Error('Email could not be sent');
    }
};
module.exports = sendEmail;