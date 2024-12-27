const QRCode = require('qrcode');

class QRCodeService {
    async generateQR(data) {
        try {
            const qrImage = await QRCode.toDataURL(data);
            return qrImage;
        } catch (error) {
            console.error('QR Code generation error:', error);
            throw new Error('QR Code generation failed');
        }
    }
}

module.exports = new QRCodeService();