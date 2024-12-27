const File = require('../models/file');
const Analytics = require('../models/Analytics');
const { v4: uuid4 } = require('uuid');
const encryptionService = require('../services/encryptionService');
const qrCodeService = require('../services/qrCodeService');
const emailService = require('../services/emailService');

class FileController {
    async upload(req, res) {
        try {
            const { filename, path, size } = req.file;
            const { password, expiryDays, encrypt } = req.body;

            let filePath = path;
            if (encrypt) {
                filePath = await encryptionService.encryptFile(path);
            }

            const file = new File({
                filename,
                uuid: uuid4(),
                path: filePath,
                size,
                sender: req.user._id,
                password,
                expiryDate: expiryDays ? Date.now() + (expiryDays * 24 * 60 * 60 * 1000) : null,
                isEncrypted: encrypt
            });

            const savedFile = await file.save();
            const qrCode = await qrCodeService.generateQR(savedFile.uuid);

            // Create analytics entry
            await Analytics.create({
                fileId: savedFile._id,
                storageUsed: size
            });

            res.json({
                file: savedFile,
                downloadLink: `${process.env.APP_BASE_URL}/files/${savedFile.uuid}`,
                qrCode
            });
        } catch (err) {
            res.status(500).json({ error: 'Upload failed' });
        }
    }

    async download(req, res) {
        try {
            const file = await File.findOne({ uuid: req.params.uuid });
            
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            if (file.password) {
                if (!req.body.password || req.body.password !== file.password) {
                    return res.status(401).json({ error: 'Incorrect password' });
                }
            }

            // Update analytics
            await Analytics.findOneAndUpdate(
                { fileId: file._id },
                { 
                    $inc: { totalDownloads: 1 },
                    $push: { 
                        downloads: {
                            timestamp: Date.now(),
                            ip: req.ip,
                            userAgent: req.headers['user-agent']
                        }
                    }
                }
            );

            let filePath = file.path;
            if (file.isEncrypted) {
                filePath = await encryptionService.decryptFile(file.path);
            }

            res.download(filePath);
        } catch (err) {
            res.status(500).json({ error: 'Download failed' });
        }
    }

    async sendEmail(req, res) {
        try {
            const { uuid, emailTo } = req.body;
            const file = await File.findOne({ uuid });

            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            file.receiver = emailTo;
            await file.save();

            // Send email
            const downloadLink = `${process.env.APP_BASE_URL}/files/${file.uuid}`;
            const emailTemplate = {
                from: process.env.MAIL_USER,
                to: emailTo,
                subject: 'InShare File Sharing',
                text: `${req.user.name} shared a file with you`,
                html: require('../services/emailTemplate')({
                    emailFrom: req.user.email,
                    downloadLink,
                    size: parseInt(file.size/1000) + ' KB',
                    expires: '24 hours'
                })
            };

            await emailService.sendMail(emailTemplate);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Email sending failed' });
        }
    }

    async getAnalytics(req, res) {
        try {
            const analytics = await Analytics.findOne({
                fileId: req.params.fileId
            }).populate('fileId');
            res.json(analytics);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    }
}

module.exports = new FileController();