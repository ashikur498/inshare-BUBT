const connectDB = require('./config/db');
const File = require('./models/file');
const fs = require('fs');

connectDB();

// Get all records older than 24 hours 
async function fetchData() {
    const files = await File.find({ createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } });

    if (files.length) {
        let deletedCount = 0;  // Track the number of deleted files
        for (const file of files) {
            try {
                // Asynchronously delete file from the filesystem
                await fs.promises.unlink(file.path);
                // Remove file record from the database
                await file.deleteOne();
                console.log(`Successfully deleted ${file.filename}`);
                deletedCount++;
            } catch (err) {
                console.log(`Error while deleting file ${file.filename}: ${err}`);
            }
        }
        console.log(`Job done! ${deletedCount} files deleted.`);
    } else {
        console.log('No files older than 24 hours found.');
    }
}

fetchData().then(process.exit);
