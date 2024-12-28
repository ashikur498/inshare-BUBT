const router = require('express').Router();
const File = require('../models/File');

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            // Change from render to json response
            return res.status(404).json({ error: 'Link has expired' });
        }
        
        // Return JSON instead of rendering a view
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