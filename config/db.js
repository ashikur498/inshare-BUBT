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



// require('dotenv').config(); // Load environment variables
// const mongoose = require('mongoose');

// async function connectDB() {
//     if (!process.env.MONGO_CONNECTION_URL) {
//         console.error('MONGO_CONNECTION_URL is not defined in the environment variables.');
//         process.exit(1); // Exit the process if the connection string is missing
//     }

//     try {
//         await mongoose.connect(process.env.MONGO_CONNECTION_URL, {
//             tls: true, // Ensure TLS is enabled
//             tlsInsecure: false, // Reject invalid certificates
//         });
//         console.log('Database connected');
//     } catch (err) {
//         console.error('Connection failed:', err);
//         process.exit(1); // Exit the process on a connection error
//     }
// }

// module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_CONNECTION_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useCreateIndex: true,
            ///useFindAndModify: false
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;