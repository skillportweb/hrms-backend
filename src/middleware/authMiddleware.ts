import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { blacklistedTokens } from '../controllers/web/UserController'; 

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export interface JwtPayload {
  id: number;
  email: string;
  role: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Check if the token is blacklisted
  if (blacklistedTokens.has(token)) {
    res.status(401).json({ message: 'Token has been blacklisted. Please log in again.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
