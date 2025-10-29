import express from 'express';
import jwt from 'jsonwebtoken';

type Response = express.Response;
type NextFunction = (err?: any) => void;

export type AuthRequest = express.Request & {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    
    req.user = decoded;
    next();
  });
};

export const generateToken = (payload: { id: string; username: string; email: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

