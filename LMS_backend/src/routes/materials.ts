const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');
const { uploadToLocal, getLocalFilePath, deleteLocalFile, STORAGE_TYPE, isS3Configured } = require('../utils/s3Storage');

// Define AuthRequest interface locally since we can't import types in CommonJS
interface AuthRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow various file types for study materials
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Get all materials for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const materials = await prisma.material.findMany({
      where: { courseId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ materials });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get material by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ material });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload material - Staff only
router.post('/', authenticateToken, requireStaff, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { courseId, title, type } = req.body;
    const file = req.file;

    // Validate input
    if (!courseId || !title || !type) {
      return res.status(400).json({ error: 'Course ID, title, and type are required' });
    }

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let filePath: string;

    // Handle file storage based on configuration
    if (STORAGE_TYPE === 's3' && isS3Configured()) {
      // S3 Storage (commented out - uncomment when S3 is configured)
      /*
      const s3Key = `materials/${Date.now()}-${file.originalname}`;
      filePath = await uploadToS3(file, s3Key);
      */
      // For now, fall back to local storage
      filePath = uploadToLocal(file, file.filename);
    } else {
      // Local storage (current active method)
      filePath = uploadToLocal(file, file.filename);
    }

    // Create material record
    const material = await prisma.material.create({
      data: {
        courseId,
        title,
        type,
        filePath: filePath,
        uploadedBy: req.user.id
      }
    });

    res.status(201).json({
      message: 'Material uploaded successfully',
      material
    });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update material - Staff only
router.put('/:id', authenticateToken, requireStaff, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, type } = req.body;

    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id }
    });

    if (!existingMaterial) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;

    // Update material
    const material = await prisma.material.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Material updated successfully',
      material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete material - Staff only
router.delete('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id }
    });

    if (!existingMaterial) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Delete material record
    await prisma.material.delete({
      where: { id }
    });

    // Delete physical file based on storage type
    if (STORAGE_TYPE === 's3' && isS3Configured()) {
      // S3 Storage (commented out - uncomment when S3 is configured)
      /*
      try {
        await deleteFromS3(existingMaterial.filePath);
      } catch (error) {
        console.error('Failed to delete file from S3:', error);
        // Don't throw error to avoid breaking the deletion
      }
      */
    } else {
      // Local storage (current active method)
      try {
        deleteLocalFile(existingMaterial.filePath);
      } catch (error) {
        console.error('Failed to delete local file:', error);
        // Don't throw error to avoid breaking the deletion
      }
    }

    res.json({
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download material file
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (STORAGE_TYPE === 's3' && isS3Configured()) {
      // S3 Storage (commented out - uncomment when S3 is configured)
      /*
      try {
        const signedUrl = await getSignedUrlForFile(material.filePath);
        res.redirect(signedUrl);
      } catch (error) {
        console.error('S3 signed URL error:', error);
        res.status(500).json({ error: 'Failed to generate download link' });
      }
      */
      // For now, fall back to local storage
      const filePath = getLocalFilePath(material.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.setHeader('Content-Disposition', `attachment; filename="${material.title}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // Local storage (current active method)
      const filePath = getLocalFilePath(material.filePath);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${material.title}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }

  } catch (error) {
    console.error('Download material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;