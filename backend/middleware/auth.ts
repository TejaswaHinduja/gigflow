import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/token';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const payload = verifyToken(header.split(' ')[1]);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
