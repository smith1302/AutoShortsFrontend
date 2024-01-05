import AWS from 'aws-sdk';
import fs from 'fs';
import axios from 'axios';

export default class DigitalOceanSpacesUploader {
    constructor() {
        this.spaceName = `autoshorts`;
        this.s3 = new AWS.S3({
            forcePathStyle: false,
            region: "us-east-1",
            endpoint: new AWS.Endpoint(process.env.SPACES_ENDPOINT),
            credentials: {
                accessKeyId: process.env.SPACES_ACCESS_KEY,
                secretAccessKey: process.env.SPACES_SECRET_KEY
            }
        });
    }

    async uploadRemoteFile(remoteFileUrl, remoteFileName, remoteFilePath = 'backgrounds') {
        try {
            // Fetch the file from the remote URL
            const response = await axios({
                method: 'get',
                url: remoteFileUrl,
                responseType: 'stream'
            });

            return new Promise((resolve, reject) => {
                // Setting up S3 upload parameters
                const params = {
                    Bucket: this.spaceName,
                    Key: `${remoteFilePath}/${remoteFileName}`,
                    Body: response.data,
                    ACL: 'public-read',
                    ContentType: 'video/mp4'
                };

                // Uploading the file to the Space
                this.s3.upload(params, function(err, data) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });
            });
        } catch (error) {
            console.error('Error fetching the remote file: ', error);
            throw error;
        }
    }

    async uploadFile(localFilePath, remoteFileName, remoteFilePath = 'shorts') {
        return new Promise((resolve, reject) => {
            // Read content from the local file
            const fileContent = fs.readFileSync(localFilePath);

            // Setting up S3 upload parameters
            const params = {
                Bucket: this.spaceName,
                Key: `${remoteFilePath}/${remoteFileName}`,
                Body: fileContent,
                ACL: 'public-read',
                ContentType: 'video/mp4'
            };

            // Uploading files to the bucket
            this.s3.upload(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    async deleteFile(remoteFileName, remoteFilePath = 'shorts') {
        return new Promise((resolve, reject) => {
            // Setting up S3 delete parameters
            const params = {
                Bucket: this.spaceName,
                Key: `${remoteFilePath}/${remoteFileName}`, // File path in the Space to be deleted
            };

            // Deleting the file from the Space
            this.s3.deleteObject(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
}