import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Interface para req.user contendo userId, username e role
interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: 'administrativo' | 'gerencial' | 'visualizacao';
  };
}

// Middleware para validar token e popular req.user
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) return res.sendStatus(403);

    // decoded é do tipo 'any', vamos tipar corretamente:
    req.user = decoded as {
      userId: number;
      username: string;
      role: 'administrativo' | 'gerencial' | 'visualizacao';
    };

    next();
  });
}

// Middleware para controlar o acesso baseado em roles permitidos
export function permitRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado: nível insuficiente' });
    }

    next();
  };
}
