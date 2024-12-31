const router = require('express').Router();
const File = require('../models/file');
router.get('/:uuid', async (req, res) => {
    // Extract link and get file from storage send download stream 
    const file = await File.findOne({ uuid: req.params.uuid });
    // Link expired
    if(!file) {
         return res.render('download', { error: 'Link has been expired.'});
    } 
    const response = await file.save();
    const filePath = `${__dirname}/../${file.path}`;
    res.download(filePath);
 });



module.exports = router;


//const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const { v4: uuid4 } = require('uuid');
const emailService = require('../services/emailService');
const encryptionService = require('../services/encryptionService');

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

// Upload file
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        // Validate request
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        try {
            // Encrypt file if encryption is enabled
            let filePath = req.file.path;
            if (process.env.ENCRYPTION_KEY) {
                filePath = await encryptionService.encryptFile(req.file.path);
            }

            // Store file in database
            const file = new File({
                filename: req.file.filename,
                uuid: uuid4(),
                path: filePath,
                size: req.file.size
            });

            const response = await file.save();
            return res.json({ 
                file: `${process.env.APP_BASE_URL}/files/${response.uuid}` 
            });
        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: 'Error uploading file.' });
        }
    });
});

// Get file info
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

// Send email
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

        // Check if email was already sent
        if (file.sender) {
            return res.status(400).json({ error: 'Email already sent.' });
        }

        file.sender = emailFrom;
        file.receiver = emailTo;

        const response = await file.save();

        // Send email
        const sendMail = require('../services/emailService');
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
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Error sending email.' });
    }
});

// Download file
router.get('/download/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        let filePath = file.path;
        
        // Decrypt file if it's encrypted
        if (process.env.ENCRYPTION_KEY && file.path.endsWith('.enc')) {
            filePath = await encryptionService.decryptFile(file.path);
        }

        res.download(filePath, file.filename, async (err) => {
            if (err) {
                console.error('Download error:', err);
                return res.status(500).json({ error: 'Error downloading file.' });
            }
            
            // Clean up decrypted file if it was created
            if (filePath !== file.path) {
                try {
                    await fs.unlink(filePath);
                } catch (error) {
                    console.error('Error deleting decrypted file:', error);
                }
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        return res.status(500).json({ error: 'Error downloading file.' });
    }
});

// Delete expired files (can be called by a cron job)
router.delete('/delete-expired', async (req, res) => {
    const fs = require('fs').promises;
    

    

    try {
        // Find files older than 24 hours
        const files = await File.find({ 
            createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
        });

        if (files.length) {
            for (const file of files) {
                try {
                    // Delete file from storage
                    await fs.unlink(file.path);
                    // Delete encrypted file if exists
                    if (file.path.endsWith('.enc')) {
                        await fs.unlink(file.path.replace('.enc', ''));
                    }
                    // Delete from database
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

module.exports = router;


/// css ta 
:root {
     --main-bg-color: #eff5fe;
     --border-color: #0288d1;
     --container-width: 500px;
     --progress-bar-color: #0288d1;
     --toast-success: #4caf50;
     --toast-error: #ff5252;
   }
   
   * {
     margin: 0;
     padding: 0;
     box-sizing: border-box;
   }
   
   body {
     font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
     background: var(--main-bg-color);
     height: 100vh;
     overflow-y: auto;
     display: flex;
     flex-direction: column;
   }
   
   /* Navigation styles */
   nav {
     width: 100%;
     height: 60px;
     padding: 0 20px;
     display: flex;
     align-items: center;
     justify-content: space-between;
     background: white;
     box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
     position: fixed; /* Add this */
     top: 0; /* Add this */
     z-index: 100; /* Add this */
   }
   
   .logo img {
     height: 40px;
   }
   
   .nav-right {
     display: flex;
     align-items: center;
     gap: 10px;
   }
   
   .nav-right button {
     padding: 8px 16px;
     border: none;
     border-radius: 4px;
     cursor: pointer;
     font-size: 14px;
     transition: all 0.3s ease;
   }
   
   #loginBtn {
     background: var(--border-color);
     color: white;
   }
   
   #registerBtn {
     background: transparent;
     border: 1px solid var(--border-color);
     color: var(--border-color);
   }
   
   #logoutBtn {
     background: #ff5252;
     color: white;
   }
   
   /* Upload container styles */
   .upload-container {
     width: var(--container-width);
     background: #ffffff;
     border-radius: 25px;
     box-shadow: 0 20px 20px 0px #00000017;
     padding: 30px;
     margin: 80px auto 20px; /* Update margin-top to 80px */;
   }
   
   .drop-zone {
     width: 100%;
     min-height: 200px;
     border: 2px dashed var(--border-color);
     border-radius: 10px;
     display: flex;
     align-items: center;
     justify-content: center;
     flex-direction: column;
     cursor: pointer;
     transition: all 0.3s ease;
   }
   
   .drop-zone.dragged {
     background: #eff5fe;
     border-color: #0288d1;
   }
   
   .icon-container {
     width: 75px;
     height: 100px;
     position: relative;
   }
   
   .icon-container img {
     width: 75px;
     position: absolute;
     transform-origin: bottom;
     transition: transform 250ms ease-in-out;
   }
   
   .icon-container .center {
     z-index: 2;
   }
   
   .icon-container .right, .icon-container .left {
     filter: grayscale(0.5);
     transform: scale(0.9);
   }
   
   .dragged .icon-container .right {
     transform: rotate(10deg) translateX(20px) scale(0.9);
   }
   
   .dragged .icon-container .left {
     transform: rotate(-10deg) translateX(-20px) scale(0.9);
   }
   
   .dragged .icon-container .center {
     transform: translateY(-5px);
   }
   
   #fileInput {
     display: none;
   }
   
   .browseBtn {
     color: var(--border-color);
     cursor: pointer;
   }
   
   /* Progress container styles */
   .progress-container {
     width: 100%;
     height: 70px;
     border: 2px solid var(--border-color);
     margin-top: 20px;
     border-radius: 10px;
     position: relative;
     display: none;
   }
   
   .progress-container .bg-progress {
     width: 0%;
     height: 100%;
     background: var(--main-bg-color);
     border-radius: 8px;
     transition: width 0.25s ease-in-out;
     position: absolute;
   }
   
   .progress-container .inner-container {
     position: absolute;
     width: 100%;
     height: 100%;
     z-index: 1;
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 0 15px;
   }
   
   .percent-container {
     font-size: 14px;
     margin: 0 15px;
     flex: 1;
   }
   
   .progress-bar {
     width: calc(100% - 150px);
     height: 3px;
     background: #03a9f4;
     border-radius: 2px;
     transform-origin: left;
     transform: scaleX(0);
     transition: transform 0.25s ease-in-out;
   }
   
   /* Sharing container styles */
   .sharing-container {
     width: 100%;
     margin-top: 20px;
     display: none;
     padding: 20px 0;
     flex-direction: column;
     gap: 20px; /* Add consistent spacing between elements */
   
   
     /*position: relative; /* Add this */
     /*z-index: 1; /* Add this */
   }
   
   .sharing-container p {
     text-align: center;
     margin-bottom: 10px;
   }
   
   .sharing-container .expire {
     color: var(--border-color);
     margin: 20px 0; /* Space around expire text */
   text-align: center;
   
   }
   
   .sharing-container .input-container {
     position: relative;
     margin: 20px 0;
   
   }
   
   .sharing-container .input-container input {
     width: 100%;
     padding: 10px 15px;
     border-radius: 5px;
     border: 2px solid var(--border-color);
     font-size: 16px;
   }
   
   .sharing-container img {
     height: 22px;
     width: 30px;
     position: absolute;
     right: 7px;
     top: 12px;
     cursor: pointer;
     background: white;
     padding: 2px;
   }
   
   /* Email container styles */
   .email-container {
     display: flex;
     flex-direction: column;
     margin-top: 20px;
   }
   
   .email-container form {
     width: 100%;
     border: 2px solid var(--border-color);
     padding: 15px;
     border-radius: 10px;
     
   }
   
   .email-container .filed {
     display: flex;
     flex-direction: column;
     margin-bottom: 15px;
   }
   
   .email-container label {
     font-size: 14px;
     margin-bottom: 5px;
   }
   
   .email-container input {
     padding: 8px 10px;
     border-radius: 5px;
     border: 1px solid #ddd;
     font-size: 14px;
   }
   
   .email-container button {
     padding: 10px 15px;
     background: var(--border-color);
     color: #fff;
     border: none;
     border-radius: 5px;
     cursor: pointer;
     font-size: 14px;
   }
   
   .email-container button:disabled {
     background: #ddd;
     cursor: not-allowed;
   }
   
   /* Toast notification styles */
   .toast {
     position: fixed;
     bottom: 10px;
     left: 50%;
     transform: translate(-50%, 60px);
     padding: 10px 20px;
     background: var(--toast-success);
     color: #fff;
     border-radius: 5px;
     font-size: 14px;
     box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
     transition: transform 0.3s ease-in-out;
   }
   
   .toast.error {
     background: var(--toast-error);
   }
   
   /* Auth Modal Styles */
   .auth-modal {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: rgba(0, 0, 0, 0.5);
     display: flex;
     justify-content: center;
     align-items: center;
     z-index: 1000;
   }
   
   .auth-container {
     background: white;
     padding: 2rem;
     border-radius: 8px;
     position: relative;
     width: 90%;
     max-width: 400px;
   }
   
   .auth-container h2 {
     margin-bottom: 1.5rem;
     color: var(--border-color);
   }
   
   .form-group {
     margin-bottom: 1rem;
   }
   
   .form-group label {
     display: block;
     margin-bottom: 0.5rem;
     color: #666;
   }
   
   .form-group input {
     width: 100%;
     padding: 0.5rem;
     border: 1px solid #ddd;
     border-radius: 4px;
     font-size: 14px;
   }
   
   .close-modal {
     position: absolute;
     top: 10px;
     right: 10px;
     background: none;
     border: none;
     font-size: 1.5rem;
     cursor: pointer;
     color: #666;
   }
   
   /* Responsive styles */
   @media screen and (max-width: 900px) {
     :root {
         --container-width: 320px;
     }
     
     .upload-container {
       margin:20px auto; /* Slightly less margin on mobile */
       width: 90%; /* Make it more responsive */
       max-width: var(--container-width);
         
     }
     
     .progress-bar {
         width: calc(100% - 100px);
     }
     
     .auth-container {
         width: 95%;
         padding: 1.5rem;
     }
   }
   
   /* Dark mode styles */
   @media (prefers-color-scheme: dark) {
     body {
         background: #1a1a1a;
         color: #fff;
     }
   
     .upload-container,
     .auth-container {
         background: #2d2d2d;
     }
   
     nav {
         background: #2d2d2d;
     }
   
     .email-container input,
     .sharing-container .input-container input,
     .form-group input {
         background: #333;
         color: #fff;
         border-color: #444;
     }
   
     .auth-container h2 {
         color: #fff;
     }
   
     .close-modal {
         color: #fff;
     }
   }
   .download {
     background: #ffffff;
     border-radius: 25px;
     box-shadow: 0 20px 20px 0 #00000017;
     padding: 2rem;
     text-align: center;
     width: 400px;
     margin: 50px auto;
   }
   
   .download__icon {
     height: 8rem;
     margin-bottom: 1rem;
   }
   
   .download__icon img {
     height: 100%;
   }
   
   .download h2 {
     margin-bottom: 1rem;
     color: #0288d1;
   }
   
   .download__meta {
     color: #0000008c;
     margin-bottom: 1rem;
   }
   
   .download__filename {
     display: block;
     margin-bottom: 0.5rem;
     font-size: 1.2rem;
   }
   
   .download__filesize {
     color: #0288d1;
   }
   
   .download__btn {
     background: #0288d1;
     color: #fff;
     padding: 1rem 2rem;
     border-radius: 5px;
     text-decoration: none;
     display: inline-block;
     font-size: 1.1rem;
     transition: all 0.2s ease;
   }
   
   .download__btn:hover {
     background: #0277bd;
     transform: scale(1.02);
   }
   
   .error {
     color: #ff5252;
     font-size: 1.2rem;
   }
   
   /* Animations */
   @keyframes pulse {
     0% {
         transform: scale(1);
     }
     50% {
         transform: scale(1.05);
     }
     100% {
         transform: scale(1);
     }
   }
   /* Add these styles to your existing style.css */
   
   /* Button states for email sending */
   button:disabled {
     background: #cccccc !important;
     cursor: not-allowed;
     opacity: 0.7;
   }
   
   /* Loading animation for send button */
   @keyframes spin {
     to { transform: rotate(360deg); }
   }
   
   button[disabled]::after {
     content: '';
     display: inline-block;
     width: 12px;
     height: 12px;
     margin-left: 10px;
     border: 2px solid #fff;
     border-radius: 50%;
     border-top-color: transparent;
     animation: spin 1s linear infinite;
   }
   
   /* Improve toast visibility */
   .toast {
     position: fixed;
     bottom: 10px;
     left: 50%;
     transform: translate(-50%, 60px);
     padding: 10px 20px;
     border-radius: 5px;
     background: var(--toast-success);
     color: #fff;
     font-size: 14px;
     box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
     transition: transform 0.3s ease-in-out;
     z-index: 1000;
   }
   
   .toast.error {
     background: var(--toast-error);
   }
   
   /* Success state for email sent */
   .email-success {
     color: var(--toast-success);
     text-align: center;
     margin-top: 10px;
     display: none;
   }
   
   .email-success.show {
     display: block;
   }
   
   /*qr shru*/
   /* Add these new styles to your existing CSS */
   
   .qr-container {
     width: 100%;
     text-align: center;
     margin: 20px 0;
     display: flex;
     flex-direction: column;
     align-items: center;
     padding: 20px;
     border: 2px solid var(--border-color);
     border-radius: 10px;
     background: #f8f9fa;
     position: relative; /* Add this */
   }
   
   .qr-container img {
     width: 150px;
     height: 150px;
     padding: 10px;
     background: white;
     border: 1px solid #ddd;
     border-radius: 5px;
     margin: 20px auto; /* Space above and below QR code */
     display: block; /* Ensure it's a block element */
   }
   
   #downloadQR {
     background: var(--border-color);
     color: #fff;
     padding: 8px 16px;
     border: none;
     border-radius: 4px;
     cursor: pointer;
     font-size: 14px;
     
     margin-bottom: 20px; /* Add margin bottom */
   
   }
   
   #downloadQR:hover {
     background: #0277bd;
     transform: scale(1.02);
   }
   
   #downloadQR:active {
     transform: scale(0.98);
   }
   
   /* Dark mode support */
   @media (prefers-color-scheme: dark) {
     .qr-container {
         background: #2d2d2d;
         border-color: #444;
     }
   
     .qr-container img {
         background: #fff; /* Keep QR code background white for readability */
     }
   }
   
   /* Mobile responsiveness */
   @media screen and (max-width: 900px) {
     .qr-container img {
         width: 120px;
         height: 120px;
     }
   }
   /*sesh*/
   
   
   .drop-zone:hover .icon-container {
     animation: pulse 1s infinite;
   }