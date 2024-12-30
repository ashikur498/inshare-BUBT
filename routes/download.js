const router = require('express').Router();
const File = require('../models/File');
const path = require('path');

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        
        if(!file) {
            return res.status(404).json({ error: 'Link has expired.' });
        } 

        const filePath = path.join(__dirname, '..', file.path);
        
        // Set content type based on file extension
        const ext = path.extname(file.filename).toLowerCase();
        const contentType = getContentType(ext);
        
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${file.filename}"`
        });

        res.sendFile(filePath);

    } catch (err) {
        console.error('Download Error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

function getContentType(ext) {
    const types = {
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
        '.mp3': 'audio/mpeg'
    };
    return types[ext] || 'application/octet-stream';
}

module.exports = router;