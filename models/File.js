const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uuid: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        ref: 'User'
    },
    receiver: {
        type: String
    },
    password: String,
    expiryDate: Date,
    downloadCount: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['documents', 'images', 'videos', 'others']
    },
    isEncrypted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('File', fileSchema);