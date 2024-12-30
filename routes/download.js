const router = require('express').Router();
const File = require('../models/File');
const path = require('path');

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Construct absolute file path
        const filePath = path.join(__dirname, '..', file.path);

        // Set correct headers for download
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.filename}"`
        });

        // Send file for download
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Download Error:', err);
                if (!res.headersSent) {
                    return res.status(500).json({ error: 'Error downloading file' });
                }
            }
        });

    } catch (err) {
        console.error('Download Error:', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;