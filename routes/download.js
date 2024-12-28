const router = require('express').Router();
const File = require('../models/File');

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return res.status(404).json({ error: 'Link has expired' });
        }

        const filePath = `${__dirname}/../${file.path}`;
        res.download(filePath);
    } catch (err) {
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;