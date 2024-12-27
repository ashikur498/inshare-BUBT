module.exports = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        url: process.env.APP_BASE_URL,
    },
    db: {
        url: process.env.MONGO_CONNECTION_URL,
    },
    email: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    security: {
        jwtSecret: process.env.JWT_SECRET,
        encryptionKey: process.env.ENCRYPTION_KEY,
        saltRounds: 10
    },
    upload: {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: [
            'image/*',
            'video/*',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip'
        ]
    }
};