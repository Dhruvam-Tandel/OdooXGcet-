const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, code) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            debug: true, // Show debug output
            logger: true  // Log information to console
        });

        const mailOptions = {
            from: `"Dayflow HRMS" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - Dayflow',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">Welcome to Dayflow!</h2>
                    <p>Please verify your email address to complete your registration.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block; margin: 10px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${code}</span>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail };
