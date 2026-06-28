import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const optionalAuthenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded: any) => {
    if (!err && decoded) {
      req.userId = decoded.userId;
      req.userRole = decoded.role;
    }
    next();
  });
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticateToken(req, res, async () => {
    try {
      // Pour éviter les problèmes desexynchronisation de token (l'utilisateur est admin en BD mais le token dit client)
      // on vérifie directement en base de données.
      const mongoose = await import('mongoose');
      const User = mongoose.model('User');
      const user: any = await User.findById(req.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé. Réservé aux administrateurs.' });
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur lors de la vérification des droits.' });
    }
  });
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Accès refusé. Token manquant.' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  });
};
