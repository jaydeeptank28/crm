/**
 * File Upload Middleware - Uses Multer
 * Matches Laravel's Spatie MediaLibrary functionality for profile images
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure upload directory exists
const uploadPath = process.env.UPLOAD_PATH || './uploads';
const profilePath = path.join(uploadPath, 'profiles');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}
if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(profilePath, { recursive: true });
}

// Storage configuration for profile images
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profilePath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: userId_timestamp.extension
        const userId = req.params.id || req.user?.id || 'new';
        const ext = path.extname(file.originalname);
        const filename = `profile_${userId}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// File filter - only allow images
const imageFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
};

// Profile image upload middleware
export const uploadProfileImage = multer({
    storage: profileStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    }
}).single('image');

// Generic storage for any file type
const genericStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subFolder = req.uploadFolder || 'misc';
        const destPath = path.join(uploadPath, subFolder);
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }
        cb(null, destPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const filename = `${baseName}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// Generic file upload
export const uploadFile = multer({
    storage: genericStorage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
    }
}).single('file');

// Multiple files upload
export const uploadMultipleFiles = multer({
    storage: genericStorage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
    }
}).array('files', 10);

/**
 * Delete file utility
 */
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

/**
 * Get full URL for uploaded file
 */
export const getFileUrl = (filename, folder = 'profiles') => {
    if (!filename) return null;
    return `/uploads/${folder}/${filename}`;
};

export default {
    uploadProfileImage,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFileUrl
};
