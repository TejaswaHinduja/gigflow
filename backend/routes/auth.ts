import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../db/schema';
import { generateToken } from '../lib/token';

export const authRoutes = Router();

authRoutes.post('/signup', async (req, res) => {
  const { name, email, password, role = 'sales' } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'Email already registered' });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });
  generateToken(user._id.toString(), user.role as string, res);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

authRoutes.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password as string))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  generateToken(user._id.toString(), user.role as string, res);
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
