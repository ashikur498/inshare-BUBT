const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    downloads: [{
        timestamp: Date,
        ip: String,
        userAgent: String
    }],
    totalDownloads: {
        type: Number,
        default: 0
    },
    storageUsed: Number,
    lastAccessed: Date
});

module.exports = mongoose.model('Analytics', analyticsSchema);