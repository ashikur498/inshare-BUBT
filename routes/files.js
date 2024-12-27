const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuid4 } = require('uuid');
const auth = require('../middleware/auth');
const fileController = require('../controllers/fileController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 } // 100MB
}).single('myfile');

router.post('/', auth, fileController.upload);
router.get('/:uuid', fileController.download);
router.post('/send', auth, fileController.sendEmail);
router.get('/analytics/:uuid', auth, fileController.getAnalytics);

module.exports = router;