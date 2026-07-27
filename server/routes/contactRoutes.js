import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/contacts.json');

// Initialize contacts file if it doesn't exist
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

// POST a new contact message
router.post('/', (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'All fields except subject are required' });
    }

    const contacts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const newContact = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      subject: subject || 'General Inquiry',
      message,
      createdAt: new Date().toISOString()
    };

    contacts.push(newContact);
    fs.writeFileSync(dataPath, JSON.stringify(contacts, null, 2));

    res.status(201).json({ message: 'Message sent successfully', data: newContact });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save contact message' });
  }
});

// GET all contact messages (Admin only normally, but kept unprotected for demonstration if needed)
router.get('/', (req, res) => {
  try {
    const contacts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contact messages' });
  }
});

export default router;
