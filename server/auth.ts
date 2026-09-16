import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { User, Entreprise, UserRole } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'relancio_jwt_secure_secret_2026_afrique_fintech_production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  entrepriseId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  company?: Entreprise;
}

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    entrepriseId: user.entreprise_id,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé : jeton d\'authentification requis' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = db.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    if (!user.actif) {
      return res.status(403).json({ error: 'Votre compte a été désactivé' });
    }

    req.user = user;

    // If company user, verify company status
    if (user.entreprise_id) {
      const company = db.getEntrepriseById(user.entreprise_id);
      if (!company) {
        return res.status(401).json({ error: 'Entreprise associée introuvable' });
      }
      if (!company.actif) {
        return res.status(403).json({ error: 'L\'accès de votre entreprise est actuellement désactivé. Veuillez contacter le support.' });
      }
      req.company = company;
    }

    next();
  } catch {
    return res.status(401).json({ error: 'Jeton invalide ou expiré' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Droits insuffisants pour accéder à cette ressource' });
    }
    next();
  };
}

export function requireTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.entreprise_id || !req.company) {
    return res.status(403).json({ error: 'Accès réservé aux comptes entreprises' });
  }
  next();
}
