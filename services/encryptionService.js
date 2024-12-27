const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    }

    async encryptFile(filePath) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            
            const fileData = await fs.readFile(filePath);
            const encrypted = Buffer.concat([iv, cipher.update(fileData), cipher.final()]);
            
            const encryptedFilePath = filePath + '.enc';
            await fs.writeFile(encryptedFilePath, encrypted);
            
            return encryptedFilePath;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('File encryption failed');
        }
    }

    async decryptFile(filePath) {
        try {
            const encryptedData = await fs.readFile(filePath);
            const iv = encryptedData.slice(0, 16);
            const encryptedFileData = encryptedData.slice(16);
            
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            const decrypted = Buffer.concat([decipher.update(encryptedFileData), decipher.final()]);
            
            const decryptedFilePath = filePath.replace('.enc', '.dec');
            await fs.writeFile(decryptedFilePath, decrypted);
            
            return decryptedFilePath;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('File decryption failed');
        }
    }
}

module.exports = new EncryptionService();