import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// GET all competitions for all players
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competition_results')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "public.competition_results" does not exist')) {
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all competitions for a specific player
router.get('/player/:playerId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competition_results')
      .select('*')
      .eq('player_id', req.params.playerId)
      .order('date', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "public.competition_results" does not exist')) {
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new competition result
router.post('/', async (req, res) => {
  try {
    const { player_id, competition_name, date, event, result_mark, postion, medal } = req.body;
    
    const { data, error } = await supabase
      .from('competition_results')
      .insert([{
        player_id,
        competition_name,
        date,
        event,
        result_mark,
        postion,
        medal
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a competition result
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('competition_results')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Competition result deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
