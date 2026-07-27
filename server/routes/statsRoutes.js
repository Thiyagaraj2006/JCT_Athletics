import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    // 1. Fetch all players
    const { data: players, error: playerError } = await supabase
      .from('users')
      .select('id, name, img, specialty')
      .eq('role', 'Player');

    if (playerError) throw playerError;

    // 2. Fetch all completed workouts
    const { data: workouts, error: workoutError } = await supabase
      .from('workouts')
      .select('player_id')
      .eq('status', 'completed');

    if (workoutError && workoutError.code !== 'PGRST205') throw workoutError;

    // 3. Fetch all trophies
    const { data: trophies, error: trophyError } = await supabase
      .from('trophies')
      .select('player_id')
      .eq('unlocked', true);

    if (trophyError && trophyError.code !== 'PGRST205') throw trophyError;

    // 4. Calculate stats for each player
    const leaderboard = players.map(player => {
      const playerWorkouts = workouts ? workouts.filter(w => w.player_id === player.id).length : 0;
      const playerTrophies = trophies ? trophies.filter(t => t.player_id === player.id).length : 0;
      
      const points = (playerWorkouts * 50) + (playerTrophies * 100);
      const level = Math.floor(points / 500) + 1;

      return {
        ...player,
        points,
        level,
        completedWorkouts: playerWorkouts,
        trophies: playerTrophies
      };
    });

    // 5. Sort descending by points
    leaderboard.sort((a, b) => b.points - a.points);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:playerId', async (req, res) => {
  try {
    const playerId = req.params.playerId;

    // 1. Fetch completed workouts
    const { data: workouts, error: workoutError } = await supabase
      .from('workouts')
      .select('id, due_date')
      .eq('player_id', playerId)
      .eq('status', 'completed')
      .order('due_date', { ascending: false });

    if (workoutError) throw workoutError;

    // 2. Fetch trophies
    const { data: trophies, error: trophyError } = await supabase
      .from('trophies')
      .select('id, unlocked')
      .eq('player_id', playerId)
      .eq('unlocked', true);

    if (trophyError) throw trophyError;

    // 3. Fetch performance records to find Personal Bests
    const { data: records, error: recordError } = await supabase
      .from('performance_records')
      .select('metric_name')
      .eq('player_id', playerId);

    if (recordError) throw recordError;

    // Calculate Total Completed Workouts
    const totalWorkouts = workouts ? workouts.length : 0;

    // Calculate Points and Level
    // 50 XP per completed workout, 100 XP per trophy
    const unlockedTrophiesCount = trophies ? trophies.length : 0;
    const points = (totalWorkouts * 50) + (unlockedTrophiesCount * 100);
    const level = Math.floor(points / 500) + 1;
    const nextLevelPoints = level * 500;

    // Calculate Personal Bests
    // We'll consider the number of unique workout types completed as a simple proxy for PBs for now,
    // or the total number of records minus some baseline.
    // Let's just use the number of unique metric_names recorded.
    const uniqueMetrics = new Set(records ? records.map(r => r.metric_name) : []);
    const personalBests = uniqueMetrics.size;

    // Calculate Current Streak
    // A simplified streak: count consecutive days backwards from the most recent workout
    let currentStreak = 0;
    if (workouts && workouts.length > 0) {
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Normalize to midnight
      
      const workoutDates = [...new Set(workouts
        .filter(w => w.due_date)
        .map(w => w.due_date.split('T')[0]))
      ].sort((a, b) => new Date(b) - new Date(a)); // Unique dates sorted descending

      if (workoutDates.length > 0) {
        let lastDate = new Date(workoutDates[0]);
        lastDate.setHours(0, 0, 0, 0);
        
        // If the most recent workout was today or yesterday, we have a valid active streak
        const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          currentStreak = 1;
          for (let i = 1; i < workoutDates.length; i++) {
            const curr = new Date(workoutDates[i-1]);
            const prev = new Date(workoutDates[i]);
            curr.setHours(0, 0, 0, 0);
            prev.setHours(0, 0, 0, 0);
            
            const diff = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
              currentStreak++;
            } else {
              break; // Streak broken
            }
          }
        }
      }
    }

    res.json({
      totalWorkouts,
      currentStreak,
      level,
      points,
      nextLevelPoints,
      personalBests
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
