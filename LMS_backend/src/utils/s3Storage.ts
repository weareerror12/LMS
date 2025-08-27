// AWS S3 Storage Utility
// This file contains commented code for future AWS S3 integration
// Currently using local file storage, but S3 integration is ready to be enabled

/*
const AWS = require('aws-sdk');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const fs = require('fs');

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'lms-materials-bucket';

// Upload file to S3
const uploadToS3 = async (file: Express.Multer.File, key: string): Promise<string> => {
  try {
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype,
      ACL: 'private', // Files are private, accessed via signed URLs
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Clean up local file after upload
    fs.unlinkSync(file.path);

    return key;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Generate signed URL for file access
const getSignedUrlForFile = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('S3 signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

// Delete file from S3
const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

// Check if S3 is configured
const isS3Configured = (): boolean => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET_NAME
  );
};

module.exports = {
  uploadToS3,
  getSignedUrlForFile,
  deleteFromS3,
  isS3Configured,
  BUCKET_NAME
};
*/

import path from 'path';
import fs from 'fs';

// Local file storage utility (currently active)
export const uploadToLocal = (file: Express.Multer.File, filename: string): string => {
  const uploadsDir = path.join(__dirname, '../../uploads');

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return filename;
};

export const getLocalFilePath = (filename: string): string => {
  return path.join(__dirname, '../../uploads', filename);
};

export const deleteLocalFile = (filename: string): void => {
  const filePath = getLocalFilePath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Future S3 integration functions (commented out)
/*
// import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export const uploadToS3 = async (file: Express.Multer.File, key: string): Promise<string> => {
//   const fileStream = fs.createReadStream(file.path);
//   const uploadParams = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME!,
//     Key: key,
//     Body: fileStream,
//     ContentType: file.mimetype,
//     ACL: 'private',
//   };
//   const command = new PutObjectCommand(uploadParams);
//   await s3Client.send(command);
//   fs.unlinkSync(file.path); // Clean up local file
//   return key;
// };

// export const getSignedUrlForFile = async (key: string, expiresIn: number = 3600): Promise<string> => {
//   const command = new GetObjectCommand({
//     Bucket: process.env.AWS_S3_BUCKET_NAME!,
//     Key: key,
//   });
//   return await getSignedUrl(s3Client, command, { expiresIn });
// };

// export const deleteFromS3 = async (key: string): Promise<void> => {
//   const command = new DeleteObjectCommand({
//     Bucket: process.env.AWS_S3_BUCKET_NAME!,
//     Key: key,
//   });
//   await s3Client.send(command);
// };
*/

export const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local'; // 'local' or 's3'

export const isS3Configured = (): boolean => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET_NAME
  );
};