const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }

    async sendMail({ from, to, subject, text, html }) {
        try {
            const info = await this.transporter.sendMail({
                from: `inShare <${from}>`,
                to,
                subject,
                text,
                html
            });
            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Email error:', error);
            throw new Error('Email sending failed');
        }
    }
}

module.exports = new EmailService();