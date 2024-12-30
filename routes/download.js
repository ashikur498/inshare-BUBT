const router = require('express').Router();
const File = require('../models/File');
const path = require('path');
const fs = require('fs');

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = path.join(__dirname, '..', file.path);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        // Set headers for file download
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.filename}"`,
            'Content-Length': file.size
        });

        // Create read stream
        const fileStream = fs.createReadStream(filePath);
        
        // Handle stream errors
        fileStream.on('error', (error) => {
            console.error('Stream Error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming file' });
            }
        });

        // Pipe the file to the response
        fileStream.pipe(res);

    } catch (error) {
        console.error('Download Error:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;