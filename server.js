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
            callback(null, true); // Allow all origins for now
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

app.use('/uploads', express.static('uploads', {
    setHeaders: (res, path, stat) => {
        res.set('Content-Type', 'application/octet-stream');
    }
}));

// Routes
app.use('/api/files', require('./routes/files'));
app.use('/api/auth', require('./routes/auth'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.get('/files/:uuid', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});