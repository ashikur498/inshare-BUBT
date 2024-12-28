const router = require('express').Router();
const File = require('../models/File');
const path = require('path');

router.get('/:uuid', async (req, res) => {
    try {
        // First, send the download page HTML
        res.sendFile(path.join(__dirname, '../public/download.html'));
    } catch (err) {
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Add a new route for getting file details
router.get('/api/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        return res.json({
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        });
    } catch (err) {
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;