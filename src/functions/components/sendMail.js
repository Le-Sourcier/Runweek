const nodemailer = require("nodemailer");

const sendMail = async ({ to, subject, text, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_PORT),
            secure: process.env.MAIL_SECURE === "true", // true pour port 465, false sinon
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `Prospect Pro - <${process.env.MAIL_FROM_ADDRESS}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: " + info.response);
        return info;
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        throw error;
    }
};

module.exports = sendMail;
