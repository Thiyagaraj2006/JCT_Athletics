import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import axios from 'axios';
import { API_BASE_URL } from './config';
import './App.css';

// Set up Axios globally
axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid or expired, clear localStorage and redirect to login
    if (error.response && error.response.status === 401) {
      // Don't loop infinitely if we're already trying to login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Public
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Players from './pages/public/Players';
import PlayerProfile from './pages/public/PlayerProfile';
import Contact from './pages/public/Contact';
import Leaderboard from './pages/public/Leaderboard';
import Login from './pages/public/Login';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePlayers from './pages/admin/ManagePlayers';
import ManageCoaches from './pages/admin/ManageCoaches';
import Messages from './pages/admin/Messages';
import Settings from './pages/admin/Settings';
import AuditLogs from './pages/admin/AuditLogs';
import AdminCompetitions from './pages/admin/Competitions';

// Coach
import CoachLayout from './layouts/CoachLayout';
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachPlayers from './pages/coach/CoachPlayers';
import CoachSubmissions from './pages/coach/CoachSubmissions';
import AssignWorkout from './pages/coach/AssignWorkout';
import CoachCompetitions from './pages/coach/Competitions';

// Player
import PlayerLayout from './layouts/PlayerLayout';
import PlayerDashboard from './pages/player/PlayerDashboard';
import TodayWorkout from './pages/player/TodayWorkout';
import TrophyCabinet from './pages/player/TrophyCabinet';
import WorkoutHistory from './pages/player/WorkoutHistory';
import Profile from './pages/player/Profile';

// Shared
import PerformanceCenter from './components/analytics/PerformanceCenter';
import Chat from './pages/shared/Chat';

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="players" element={<Players />} />
          <Route path="players/:id" element={<PlayerProfile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="players" element={<ManagePlayers />} />
          <Route path="coaches" element={<ManageCoaches />} />
          <Route path="messages" element={<Messages />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="competitions" element={<AdminCompetitions />} />
        </Route>

        {/* Coach Routes */}
        <Route path="/coach" element={<CoachLayout />}>
          <Route index element={<CoachDashboard />} />
          <Route path="players" element={<CoachPlayers />} />
          <Route path="assign-workout" element={<AssignWorkout />} />
          <Route path="submissions" element={<CoachSubmissions />} />
          <Route path="messages" element={<Chat />} />
          <Route path="competitions" element={<CoachCompetitions />} />
          <Route path="calendar" element={<div style={{padding: '2rem'}}><h2>Calendar (Placeholder)</h2></div>} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Player Routes */}
        <Route path="/player" element={<PlayerLayout />}>
          <Route index element={<PlayerDashboard />} />
          <Route path="today" element={<TodayWorkout />} />
          <Route path="history" element={<WorkoutHistory />} />
          <Route path="performance" element={<PerformanceCenter />} />
          <Route path="trophies" element={<TrophyCabinet />} />
          <Route path="messages" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
