import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../auth.js';
import { User, Entreprise } from '../types.js';

export const authRouter = Router();

function sanitizeUser(user: User) {
  const { password_hash: _password_hash, ...safe } = user;
  return safe;
}

// Inscription Entreprise
authRouter.post('/register', (req, res: Response) => {
  try {
    const {
      nom_entreprise,
      responsable,
      email,
      telephone,
      secteur,
      password,
      confirm_password,
    } = req.body;

    // Validation
    if (!nom_entreprise || !responsable || !email || !telephone || !secteur || !password) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être renseignés.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
    }

    // Email already registered check
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Cet email est déjà associé à un compte existant.' });
    }

    const now = new Date().toISOString();
    const entrepriseId = 'ent-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    // 1. Create company
    const newEntreprise: Entreprise = {
      id: entrepriseId,
      nom: nom_entreprise.trim(),
      responsable: responsable.trim(),
      email: email.trim().toLowerCase(),
      telephone: telephone.trim(),
      secteur: secteur.trim(),
      logo: null,
      couleur_principale: '#10b981',
      couleur_secondaire: '#0ea5e9',
      adresse: '',
      actif: true,
      created_at: now,
      updated_at: now,
    };
    db.createEntreprise(newEntreprise);

    // 2. Hash password and create user
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: userId,
      entreprise_id: entrepriseId,
      nom: responsable.trim(),
      email: email.trim().toLowerCase(),
      telephone: telephone.trim(),
      password_hash: passwordHash,
      role: 'ENTREPRISE_ADMIN',
      actif: true,
      created_at: now,
      updated_at: now,
    };
    db.createUser(newUser);

    // 3. Log activity
    db.logActivity(entrepriseId, 'Inscription Entreprise', `Création du compte pour ${newEntreprise.nom}`);

    // 4. Token & auto-login response
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Entreprise créée avec succès',
      token,
      user: sanitizeUser(newUser),
      company: newEntreprise,
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur lors de l\'inscription.' });
  }
});

// Connexion Entreprise
authRouter.post('/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    if (!user.actif) {
      return res.status(403).json({ error: 'Votre compte utilisateur est désactivé.' });
    }

    let company: Entreprise | undefined = undefined;
    if (user.entreprise_id) {
      company = db.getEntrepriseById(user.entreprise_id);
      if (!company) {
        return res.status(401).json({ error: 'Entreprise associée introuvable.' });
      }
      if (!company.actif) {
        return res.status(403).json({ error: 'L\'accès de votre entreprise est actuellement suspendu.' });
      }
    }

    db.logActivity(user.entreprise_id, 'Connexion', `Connexion de l'utilisateur ${user.nom}`);
    const token = generateToken(user);

    return res.json({
      message: 'Connexion réussie',
      token,
      user: sanitizeUser(user),
      company,
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur lors de la connexion.' });
  }
});

// Connexion Super Admin
authRouter.post('/admin/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const user = db.getUserByEmail(email);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(401).json({ error: 'Accès administrateur refusé ou identifiants incorrects.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    if (!user.actif) {
      return res.status(403).json({ error: 'Ce compte administrateur a été désactivé.' });
    }

    db.logActivity(null, 'Connexion Super Admin', `Accès au portail admin par ${user.email}`);
    const token = generateToken(user);

    return res.json({
      message: 'Connexion Super Admin validée',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Erreur connexion admin:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la connexion admin.' });
  }
});

// Vérification de session active
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  return res.json({
    user: sanitizeUser(req.user),
    company: req.company,
  });
});

// Déconnexion (confirmation côté serveur pour cycle propre)
authRouter.post('/logout', (req, res: Response) => {
  return res.json({ message: 'Session terminée avec succès' });
});

