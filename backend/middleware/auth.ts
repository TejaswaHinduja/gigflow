import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/token';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.jwt;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
