const router = require('express').Router();
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await Analytics.aggregate([
            {
                $group: {
                    _id: null,
                    totalDownloads: { $sum: '$totalDownloads' },
                    totalStorage: { $sum: '$storageUsed' }
                }
            }
        ]);
        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;