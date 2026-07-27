import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all messages for admin view
router.get('/admin', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(name, email, role), receiver:users!messages_receiver_id_fkey(name, email, role)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat contacts for a user
router.get('/contacts/:userId', async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.userId)
      .single();

    if (userError) throw userError;

    let contacts = [];
    if (user.role === 'Player' && user.assigned_coach) {
      // Find the coach by name
      const { data: coachData } = await supabase
        .from('users')
        .select('id, name, img, role')
        .eq('role', 'Coach')
        .eq('name', user.assigned_coach)
        .single();
      if (coachData) contacts.push(coachData);
    } else if (user.role === 'Coach') {
      // Find all players assigned to this coach
      const { data: playersData } = await supabase
        .from('users')
        .select('id, name, img, role')
        .eq('role', 'Player')
        .eq('assigned_coach', user.name);
      if (playersData) contacts = playersData;
    }

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a user
router.get('/:userId', async (req, res) => {
  try {
    // Basic validation to prevent UUID syntax errors if non-UUID is passed
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(name), receiver:users!messages_receiver_id_fkey(name)')
      .or(`sender_id.eq.${req.params.userId},receiver_id.eq.${req.params.userId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const { sender_id, receiver_id, text, is_group } = req.body;
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id, receiver_id, text, is_group }])
      .select('*, sender:users!messages_sender_id_fkey(name), receiver:users!messages_receiver_id_fkey(name)');

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
