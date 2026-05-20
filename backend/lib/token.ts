import jwt from 'jsonwebtoken';
import dotenv from "dotenv"
dotenv.config()
const SECRET = process.env.JWT_SECRET ;

export function generateToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { userId: string; role: string };
}
