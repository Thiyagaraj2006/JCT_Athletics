import express from 'express';
import { supabase } from '../supabaseClient.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all players
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'Player')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all players for a specific coach
router.get('/coach/:coachName', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'Player')
      .eq('assigned_coach', req.params.coachName)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific player
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new player
router.post('/', async (req, res) => {
  try {
    const { name, email, event, coach, status, password, img } = req.body;
    
    // Use provided password or default to password123
    const salt = await bcrypt.genSalt(10);
    const rawPassword = password && password.trim() !== '' ? password : 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    
    const insertData = { 
      name, 
      email, 
      role: 'Player',
      specialty: event,
      assigned_coach: coach,
      status: status || 'Active',
      password: hashedPassword
    };
    
    if (img) {
      insertData.img = img;
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([insertData])
      .select();

    if (error) throw error;
    
    // Remove password before sending response
    const { password: _, ...safeData } = data[0];
    res.status(201).json(safeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a player
router.put('/:id', async (req, res) => {
  try {
    const { name, email, event, coach, status, password, img } = req.body;
    
    // Build update object
    const updateData = { 
      name, 
      email,
      specialty: event,
      assigned_coach: coach,
      status
    };
    
    // Only include img if it was provided (to prevent errors if the DB column isn't created yet)
    if (img) {
      updateData.img = img;
    }
    
    // If a new password is provided, hash it and add to update
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    
    // Remove password before sending back
    const { password: _, ...safeData } = data[0];
    res.json(safeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a player
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
