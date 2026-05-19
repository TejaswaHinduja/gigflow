import cors from 'cors';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { connectDB } from './db/db';
import { authRoutes } from './routes/auth';
import { leadsRoutes } from './routes/leads';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

connectDB().then(() => {
  app.listen(2000, () => console.log('Server running on port 2000'));
});
