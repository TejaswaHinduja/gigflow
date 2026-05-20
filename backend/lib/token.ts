import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function generateToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { userId: string; role: string };
}
