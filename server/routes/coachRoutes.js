import express from 'express';
import { supabase } from '../supabaseClient.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all coaches
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'Coach')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific coach
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

// Add a new coach
router.post('/', async (req, res) => {
  try {
    const { name, email, specialty, status, password, img } = req.body;
    
    // Use provided password or default to password123
    const salt = await bcrypt.genSalt(10);
    const rawPassword = password && password.trim() !== '' ? password : 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    
    const insertData = { 
      name, 
      email, 
      role: 'Coach', 
      specialty, 
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

// Update a coach
router.put('/:id', async (req, res) => {
  try {
    const { name, email, specialty, status, password, img } = req.body;
    
    // Build update object
    const updateData = { name, email, specialty, status };
    
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

// Delete a coach
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign players to a coach
router.put('/:id/assign', async (req, res) => {
  try {
    const coachId = req.params.id;
    const { playerIds } = req.body; // Array of player IDs
    
    // First, get the coach's name to use as the assigned_coach string
    const { data: coachData, error: coachError } = await supabase
      .from('users')
      .select('name')
      .eq('id', coachId)
      .single();
      
    if (coachError) throw coachError;
    const coachName = coachData.name;

    // Remove this coach from all players who currently have them assigned
    const { error: unassignError } = await supabase
      .from('users')
      .update({ assigned_coach: '' })
      .eq('assigned_coach', coachName)
      .eq('role', 'Player');
      
    if (unassignError) throw unassignError;

    // If there are players to assign, assign them to this coach
    if (playerIds && playerIds.length > 0) {
      const { error: assignError } = await supabase
        .from('users')
        .update({ assigned_coach: coachName })
        .in('id', playerIds)
        .eq('role', 'Player');
        
      if (assignError) throw assignError;
    }

    res.json({ message: 'Players assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
