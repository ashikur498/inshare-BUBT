const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});