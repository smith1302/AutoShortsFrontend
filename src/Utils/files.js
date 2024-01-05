import fs from 'fs';
import path from 'path';

function createFolder(filePath) {
    const isFile = path.extname(filePath) !== '';
    let directoryPath = isFile ? path.dirname(filePath) : filePath;
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
}

const deleteFile = (filePath) => {
    // Check if file exists first
    if (!filePath || !fs.existsSync(filePath)) return;

    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

const randomString = (length = 18) => {
    return Math.random().toString(36).substring(2, length);
}

const getRandomFileName = (extension) => {
    return `${randomString()}.${extension}`;
}

const getUniqueFileKey = () => {
    const d = new Date();
    return `${d.getMonth()}_${d.getDate()}_${d.getHours()}${d.getMinutes()}${d.getSeconds()}`;
}

export default {
    getUniqueFileKey,
    createFolder,
    getRandomFileName,
    deleteFile,
    randomString
}