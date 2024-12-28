const router = require('express').Router();
const File = require('../models/File');


router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        // Link expired
        if(!file) {
            return res.status(404).json({ error: 'Link has expired' });
        } 
        return res.render('download', { 
            uuid: file.uuid, 
            fileName: file.filename, 
            fileSize: file.size, 
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}` });//domain name ba host 
    } catch(err) {
        return res.render('download', { error: 'Something went wrong.'});
    }
});

module.exports = router;