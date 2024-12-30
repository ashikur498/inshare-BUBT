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
            return res.status(404).json({ error: 'File not found' });
        }

        // Get file extension
        const ext = path.extname(file.filename).toLowerCase();

        // Set appropriate content type based on file extension
        const contentType = getContentType(ext);
        
        // Set headers
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${file.filename}"`,
            'Content-Length': file.size
        });

        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Handle stream errors
        fileStream.on('error', (error) => {
            console.error('Stream Error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error downloading file' });
            }
        });

    } catch (err) {
        console.error('Download Error:', err);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Something went wrong' });
        }
    }
});

// Helper function to determine content type
function getContentType(ext) {
    const contentTypes = {
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
        '.mp3': 'audio/mpeg',
    };

    return contentTypes[ext] || 'application/octet-stream';
}

module.exports = router;