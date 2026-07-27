import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/dashboard-stats', async (req, res) => {
  try {
    // 1. Total Athletes
    const { count: totalAthletes, error: athletesError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'Player');
      
    if (athletesError) throw athletesError;

    // 2. Active Workouts Today (status = pending and due_date >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: activeWorkouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('created_at', today.toISOString());
      
    if (workoutsError) throw workoutsError;

    // 3. Avg Completion Rate
    const { count: totalWorkoutsCount, error: totalWorkoutsError } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true });
      
    const { count: completedWorkoutsCount, error: completedWorkoutsError } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');
      
    let avgCompletionRate = 0;
    if (totalWorkoutsCount > 0) {
      avgCompletionRate = Math.round((completedWorkoutsCount / totalWorkoutsCount) * 100);
    }

    // 4. Personal Bests (Week)
    // We'll approximate this by checking performance_records added in the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const { count: personalBests, error: pbError } = await supabase
      .from('performance_records')
      .select('*', { count: 'exact', head: true })
      .gte('recorded_at', lastWeek.toISOString());

    if (pbError) throw pbError;

    // 5. Total Trophies (Championships)
    const { count: totalTrophies, error: trophiesError } = await supabase
      .from('trophies')
      .select('*', { count: 'exact', head: true });

    if (trophiesError) throw trophiesError;

    // 6. Personal Bests (Year)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const { count: personalBestsYear, error: pbYearError } = await supabase
      .from('performance_records')
      .select('*', { count: 'exact', head: true })
      .gte('recorded_at', lastYear.toISOString());

    if (pbYearError) throw pbYearError;

    res.json({
      totalAthletes: totalAthletes || 0,
      activeWorkoutsToday: activeWorkouts || 0,
      avgCompletionRate: avgCompletionRate,
      personalBestsWeek: personalBests || 0,
      totalTrophies: totalTrophies || 0,
      personalBestsYear: personalBestsYear || 0
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
