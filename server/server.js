import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow frontend connections
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Default to allow all, but configurable for production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic test routes
app.get('/', (req, res) => {
  res.send('Atheleic Backend API is running! Access the frontend at http://localhost:5173');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

import playerRoutes from './routes/playerRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import competitionRoutes from './routes/competitionRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import groupPhotoRoutes from './routes/groupPhotoRoutes.js';
import { verifyToken, requireRole } from './middleware/authMiddleware.js';

app.use('/api/auth', authRoutes); // Auth routes should not be protected
app.use('/api/contact', contactRoutes); // Contact routes should not be protected
app.use('/api/group-photos', groupPhotoRoutes);

// Protected routes
app.use('/api/players', verifyToken, playerRoutes);
app.use('/api/coaches', verifyToken, coachRoutes);
app.use('/api/workouts', verifyToken, workoutRoutes);
app.use('/api/performance', verifyToken, performanceRoutes);
app.use('/api/stats', verifyToken, statsRoutes);
app.use('/api/messages', verifyToken, messageRoutes);
app.use('/api/audit', verifyToken, requireRole(['Admin']), auditRoutes);
app.use('/api/admin', verifyToken, requireRole(['Admin']), adminRoutes);
app.use('/api/upload', verifyToken, uploadRoutes);
app.use('/api/competitions', verifyToken, competitionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
