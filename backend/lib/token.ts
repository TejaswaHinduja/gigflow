import jwt from 'jsonwebtoken';
import dotenv from "dotenv"
import { Response } from 'express';
dotenv.config()
const SECRET = process.env.JWT_SECRET || "!23";

export function generateToken(userId: string, role: string, res: Response) {
  const token = jwt.sign({ userId, role }, SECRET, { expiresIn: '7d' });
  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV !== 'development',
  });
  return token;
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { userId: string; role: string };
}
