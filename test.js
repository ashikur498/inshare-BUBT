require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_CONNECTION_URL;

async function testConnection() {
    try {
        const client = new MongoClient(uri, { tls: true });
        await client.connect();
        console.log("Connected successfully to MongoDB");
        await client.close();
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

testConnection();
