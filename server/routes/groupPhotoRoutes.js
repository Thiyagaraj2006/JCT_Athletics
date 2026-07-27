import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsFile = path.join(__dirname, '../data/settings.json');

const router = express.Router();

// Helper to ensure data directory and settings file exist
const getSettings = () => {
  if (!fs.existsSync(path.dirname(settingsFile))) {
    fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  }
  if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
};

const saveSettings = (data) => {
  fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
};

// GET /api/group-photos - Public access
router.get('/', (req, res) => {
  try {
    const settings = getSettings();
    res.json({ image_url: settings.groupPhotoUrl || null });
  } catch (error) {
    console.error('Error fetching group photo:', error);
    res.status(500).json({ error: 'Failed to retrieve group photo URL' });
  }
});

// POST /api/group-photos - Protected
router.post('/', verifyToken, requireRole(['Admin']), (req, res) => {
  try {
    const { image_url } = req.body;
    if (image_url === undefined) {
      return res.status(400).json({ error: 'image_url is required' });
    }
    const settings = getSettings();
    settings.groupPhotoUrl = image_url;
    saveSettings(settings);
    res.json({ message: 'Group photo updated successfully', image_url });
  } catch (error) {
    console.error('Error saving group photo:', error);
    res.status(500).json({ error: 'Failed to update group photo URL' });
  }
});

export default router;
