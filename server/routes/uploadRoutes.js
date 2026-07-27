import express from 'express';
import multer from 'multer';
import path from 'path';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Ensure 'uploads' bucket exists in Supabase
async function ensureBucketExists() {
  try {
    const { data, error } = await supabase.storage.getBucket('uploads');
    if (error && error.message.includes('not found')) {
      await supabase.storage.createBucket('uploads', { public: true });
      console.log('Created Supabase storage bucket: uploads');
    }
  } catch (err) {
    console.error('Error checking bucket:', err);
  }
}
ensureBucketExists();

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${uniqueSuffix}${path.extname(req.file.originalname)}`;
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    res.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
