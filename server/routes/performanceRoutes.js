import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get performance records for a coach's players
router.get('/coach/:coachId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('performance_records')
      .select('*, workouts!inner(coach_id, type), player:users!performance_records_player_id_fkey(name)')
      .eq('workouts.coach_id', req.params.coachId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get performance records for a player
router.get('/:playerId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('performance_records')
      .select('*, workouts(type)')
      .eq('player_id', req.params.playerId)
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trophies for a player
router.get('/:playerId/trophies', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trophies')
      .select('*')
      .eq('player_id', req.params.playerId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a performance record
router.post('/', async (req, res) => {
  try {
    const { player_id, workout_id, metric_name, metric_value, metric_unit } = req.body;
    
    const { data, error } = await supabase
      .from('performance_records')
      .insert([{ player_id, workout_id, metric_name, metric_value, metric_unit }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
