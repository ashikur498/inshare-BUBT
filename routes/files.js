const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const { v4: uuid4 } = require('uuid');
const auth = require('../middleware/auth'); // If you're using authentication

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 1000000 * 100 // 100MB
    }
}).single('myfile');

// Upload file
router.post('/', (req, res) => {
    // Store file
    upload(req, res, async (err) => {
        // Validate request
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Store into Database
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size
        });

        try {
            const response = await file.save();
            return res.json({ 
                file: `${process.env.APP_BASE_URL}/files/${response.uuid}` 
            });
        } catch (err) {
            return res.status(500).json({ error: 'Error saving file to database.' });
        }
    });
});

// Email sending route
router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom } = req.body;

    // Validate request
    if (!uuid || !emailTo || !emailFrom) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Get file from database
        const file = await File.findOne({ uuid: uuid });

        if (!file) {
            return res.status(404).json({ error: 'File not found.' });
        }

        // Check if file was already sent
        if (file.sender) {
            return res.status(400).json({ error: 'Email already sent.' });
        }

        file.sender = emailFrom;
        file.receiver = emailTo;

        const response = await file.save();

        // Send email
        const sendMail = require('../services/emailService');
        sendMail({
            from: emailFrom,
            to: emailTo,
            subject: 'inShare file sharing',
            text: `${emailFrom} shared a file with you.`,
            html: require('../services/emailTemplate')({
                emailFrom: emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
                size: parseInt(file.size/1000) + ' KB',
                expires: '24 hours'
            })
        }).then(() => {
            return res.json({ success: true });
        }).catch(err => {
            return res.status(500).json({ error: 'Error in email sending.' });
        });
    } catch (err) {
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Get file info route
router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return res.status(404).json({ error: 'File not found.' });
        }
        return res.json({
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        });
    } catch (err) {
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Download file route
router.get('/download/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        
        if (!file) {
            return res.status(404).json({ error: 'File not found.' });
        }

        const filePath = path.join(__dirname, '..', file.path);
        res.download(filePath);
    } catch (err) {
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Delete expired files route (optional, can be used with a cron job)
router.delete('/delete-expired', async (req, res) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
        const files = await File.find({ createdAt: { $lt: twentyFourHoursAgo } });
        
        if (files.length) {
            for (const file of files) {
                try {
                    fs.unlinkSync(file.path);
                    await file.remove();
                } catch (err) {
                    console.error(err);
                }
            }
        }
        return res.json({ message: 'Expired files cleaned up.' });
    } catch (err) {
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

module.exports = router;