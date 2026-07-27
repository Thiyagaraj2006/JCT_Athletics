import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all workouts for a coach
router.get('/coach/:coachId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('coach_id', req.params.coachId)
      .order('due_date', { ascending: false });

    if (error) throw error;
    
    // Fetch player names manually to avoid PGRST200 schema cache errors
    const { data: users } = await supabase.from('users').select('id, name');
    const userMap = {};
    if (users) {
      users.forEach(u => { userMap[u.id] = u.name; });
    }
    
    const enrichedData = data.map(w => ({
      ...w,
      player: { name: userMap[w.player_id] || 'Unknown Player' }
    }));
    
    res.json(enrichedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all workouts for a player
router.get('/:playerId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('player_id', req.params.playerId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    // Fetch coach names manually to avoid PGRST200 schema cache errors
    const { data: users } = await supabase.from('users').select('id, name');
    const userMap = {};
    if (users) {
      users.forEach(u => { userMap[u.id] = u.name; });
    }
    
    const enrichedData = data.map(w => ({
      ...w,
      coach: { name: userMap[w.coach_id] || 'Unknown Coach' }
    }));

    res.json(enrichedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign a new workout
router.post('/', async (req, res) => {
  try {
    const { player_id, coach_id, type, target, due_date } = req.body;
    
    const { data, error } = await supabase
      .from('workouts')
      .insert([{ player_id, coach_id, type, target, due_date }])
      .select();

    if (error) throw error;

    // Also log this action
    if (coach_id) {
      const { data: coachData } = await supabase.from('users').select('name, role').eq('id', coach_id).single();
      if (coachData) {
        await supabase.from('audit_logs').insert([{
          user_id: coach_id,
          user_name: coachData.name,
          role: coachData.role,
          action: 'CREATE',
          details: `Assigned ${type} to player ID ${player_id}`
        }]);
      }
    }

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update workout status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('workouts')
      .update({ status })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    
    // Automatically manage trophies if a workout is completed
    if (status === 'completed' && data[0]) {
      const playerId = data[0].player_id;
      
      // Count total completed workouts
      const { count: completedCount, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerId)
        .eq('status', 'completed');
        
      if (!countError && completedCount !== null) {
        const milestones = [
          { threshold: 1, title: 'First Steps', desc: 'Completed your very first workout.', icon: 'award', color: '#3B82F6' },
          { threshold: 5, title: 'Getting Serious', desc: 'Completed 5 workouts.', icon: 'star', color: '#8B5CF6' },
          { threshold: 10, title: 'Consistent Performer', desc: 'Completed 10 workouts.', icon: 'zap', color: '#F59E0B' },
          { threshold: 50, title: 'Unstoppable', desc: 'Completed 50 workouts.', icon: 'flame', color: '#EF4444' }
        ];
        
        for (const m of milestones) {
          if (completedCount >= m.threshold) {
            // Check if trophy already exists
            const { data: existingTrophy } = await supabase
              .from('trophies')
              .select('id')
              .eq('player_id', playerId)
              .eq('title', m.title)
              .single();
              
            if (!existingTrophy) {
              // Unlock new trophy
              await supabase.from('trophies').insert([{
                player_id: playerId,
                title: m.title,
                description: m.desc,
                icon: m.icon,
                color: m.color,
                unlocked: true,
                progress: 100,
                unlocked_at: new Date().toISOString()
              }]);
            }
          }
        }
      }
    }

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
