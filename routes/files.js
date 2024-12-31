const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const { v4: uuid4 } = require('uuid');
const sendMail = require('../services/emailService');
const QRCode = require('qrcode');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 }, // 100mb
}).single('myfile');

// Upload file route
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        try {
            const file = new File({
                filename: req.file.originalname,
                uuid: uuid4(),
                path: req.file.path,
                size: req.file.size
            });

            const response = await file.save();
            const fileUrl = `${process.env.APP_BASE_URL}/files/${response.uuid}`;
            const qrCode = await QRCode.toDataURL(fileUrl);
            return res.json({ 
                file: fileUrl,
                qrCode: qrCode
            });
        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: 'Error uploading file.' });
        }
    });
});

// Get file info route
router.get('/:uuid', async (req, res) => {
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
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Send email route
router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom } = req.body;

    // Validate request
    if (!uuid || !emailTo || !emailFrom) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const file = await File.findOne({ uuid: uuid });

        if (!file) {
            return res.status(404).json({ error: 'File not found.' });
        }

        if (file.sender) {
            return res.status(400).json({ error: 'Email already sent.' });
        }

        file.sender = emailFrom;
        file.receiver = emailTo;

        await file.save();

        // Send email
        try {
            await sendMail({
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
            });
            return res.json({ success: true });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({ error: 'Error sending email.' });
        }
    } catch (error) {
        console.error('File processing error:', error);
        return res.status(500).json({ error: 'Error processing file.' });
    }
});

// Delete expired files route
router.delete('/delete-expired', async (req, res) => {
    const fs = require('fs').promises;
    
    try {
        const files = await File.find({ 
            createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
        });

        if (files.length) {
            for (const file of files) {
                try {
                    await fs.unlink(file.path);
                    await file.remove();
                } catch (error) {
                    console.error(`Error deleting file ${file.filename}:`, error);
                }
            }
            return res.json({ message: `Deleted ${files.length} expired files` });
        }
        return res.json({ message: 'No expired files found' });
    } catch (error) {
        console.error('Error cleaning up files:', error);
        return res.status(500).json({ error: 'Error cleaning up files' });
    }
});

// Test email route (optional, for testing purposes)

module.exports = router;