import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Rate limiter
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});