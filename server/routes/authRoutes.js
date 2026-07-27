import express from 'express';
import { supabase } from '../supabaseClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple login based on email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Look up the user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    if (!user.password) {
      return res.status(401).json({ error: 'User has no password set' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Remove password from user object before sending
    const { password: _, ...safeUser } = user;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: safeUser.id, role: safeUser.role, name: safeUser.name },
      process.env.JWT_SECRET || 'dev_secret_key_123',
      { expiresIn: '24h' }
    );
    
    // Return the user data and token
    res.json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Update Profile
router.put('/profile', async (req, res) => {
  try {
    const { id, name, email, avatarBase64 } = req.body;
    
    const updatePayload = { name, email };
    
    // 2. Save Avatar Image if provided
    if (avatarBase64) {
      const matches = avatarBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const imageBuffer = Buffer.from(matches[2], 'base64');
        const filePath = path.join(uploadsDir, `${id}.jpg`);
        fs.writeFileSync(filePath, imageBuffer);
        
        // Add to payload to save in DB
        updatePayload.img = `/uploads/${id}.jpg`;
      }
    }
    
    // 1. Update Database
    const { data: user, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    


    const { password: _, ...safeUser } = user;
    res.json(safeUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
