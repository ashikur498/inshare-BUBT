require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

// Middleware to serve static files from the 'front' folder
app.use(express.static(path.join(__dirname, 'front')));

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the database
const connectDB = require('./config/db');
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(','),
};
app.use(cors(corsOptions));

// Set up EJS template engine (if needed)
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// Serve the front's index.html as the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

// API routes
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});
