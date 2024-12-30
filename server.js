const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to Database
connectDB();

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_CLIENTS ? 
            process.env.ALLOWED_CLIENTS.split(',') : 
            ['https://inshare-bubt.onrender.com', 'http://localhost:3000'];
            
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Serve uploads with proper content types
app.use('/uploads', express.static('uploads', {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = getContentType(ext);
        res.set('Content-Type', contentType);
    }
}));

// Routes
app.use('/api/files', require('./routes/files'));
app.use('/api/auth', require('./routes/auth'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

function getContentType(ext) {
    const types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.zip': 'application/zip',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg'
    };
    return types[ext] || 'application/octet-stream';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});