// require('dotenv').config();//env te ja likhbo ekhne add hobe 
// const mongoose = require('mongoose');
// function connectDB() {
//     // Database connection 
//     mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true,
//          useUnifiedTopology: true });
//     const connection = mongoose.connection;//url hide kore rakhbo karon security 
//     connection.once('open', () => {
//         console.log('Database connected');
//     }).catch(err => {
//         console.log('Connection failed');
//     })
// }

// // mIAY0a6u1ByJsWWZ

// module.exports = connectDB;

// require('dotenv').config(); // Load environment variables
// const mongoose = require('mongoose');

// function connectDB() {
//     // Database connection
//     mongoose.connect(process.env.MONGO_CONNECTION_URL, {
//         useNewUrlParser: true,
//         //useCreateIndex: true,
//         useUnifiedTopology: true,
//         //useFindAndModify: false, // Use false here to avoid deprecation warnings
//     })
//     .then(() => {
//         console.log('Database connected');
//     })
//     .catch((err) => {
//         console.error('Connection failed:', err);
//     });
// }

// module.exports = connectDB;

// require('dotenv').config(); // Load environment variables
// const mongoose = require('mongoose');

// async function connectDB() {
//     if (!process.env.MONGO_CONNECTION_URL) {
//         console.error('MONGO_CONNECTION_URL is not defined in the environment variables.');
//         process.exit(1); // Exit the process if the connection string is missing
//     }

//     try {
//         await mongoose.connect(process.env.MONGO_CONNECTION_URL); // No additional options are required
//         console.log('Database connected');
//     } catch (err) {
//         console.error('Connection failed:', err);
//         process.exit(1); // Exit the process on a connection error
//     }
// }

// module.exports = connectDB;



require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');

async function connectDB() {
    // Check if the connection string is provided in the environment variables
    if (!process.env.MONGO_CONNECTION_URL) {
        console.error('MONGO_CONNECTION_URL is not defined in the environment variables.');
        process.exit(1); // Exit the process if the connection string is missing
    }

    try {
        // Establish a connection to the MongoDB database
        await mongoose.connect(process.env.MONGO_CONNECTION_URL, {
            useNewUrlParser: true, // Avoid deprecation warnings
            useUnifiedTopology: true, // Use the new server discovery and monitoring engine
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if unable to connect
        });
        console.log('Database connected successfully.');
    } catch (err) {
        // Provide a detailed error message to aid debugging
        console.error('Connection failed:', err.message);
        if (err.reason && err.reason.message) {
            console.error('Reason:', err.reason.message);
        }
        process.exit(1); // Exit the process on a connection error
    }
}

module.exports = connectDB;
