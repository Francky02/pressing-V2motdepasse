import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../auth.js';
import { User, Entreprise } from '../types.js';
import { sendPasswordResetEmail, isSmtpConfigured } from '../services/mailer.service.js';

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
    const identifier = (req.body.email || req.body.identifier || req.body.telephone || req.body.phone || '').toString();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
    }

    const user = db.getUserByIdentifier(identifier);
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

// Demande de réinitialisation de mot de passe (Mot de passe oublié)
authRouter.post('/forgot-password', async (req, res: Response) => {
  try {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Format d\'adresse e-mail invalide.' });
    }

    const genericResponse = {
      message: 'Si un compte correspond à cette adresse, un lien de réinitialisation vient d\'être envoyé.',
    };

    const cleanEmail = email.trim().toLowerCase();
    const user = db.getUserByEmail(cleanEmail);

    // Ne jamais révéler publiquement si l'adresse existe ou non
    if (!user || !user.actif) {
      return res.json(genericResponse);
    }

    // Protection anti-abus / brute-force : max 3 demandes par 15 minutes par utilisateur
    const recentAttempts = db.getRecentResetTokensCount(user.id, 15);
    if (recentAttempts >= 3) {
      return res.json(genericResponse);
    }

    // Génération d'un token cryptographiquement sécurisé
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Sauvegarde en base (durée de validité 60 minutes)
    db.createPasswordResetToken(user.id, tokenHash, 60);

    // Construction du lien absolu vers la page frontend
    const appUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const resetUrl = `${appUrl}/reinitialiser-mot-de-passe/${rawToken}`;

    // Envoi via service de messagerie (SMTP réel si configuré, sinon mode dev sans blocage)
    const mailResult = await sendPasswordResetEmail({
      to: user.email,
      userName: user.nom,
      resetUrl,
      expiresInMinutes: 60,
    });

    const smtpActive = isSmtpConfigured();
    db.logActivity(
      user.entreprise_id,
      'Demande réinitialisation MDP',
      smtpActive && mailResult.success
        ? `Lien de réinitialisation envoyé par e-mail à ${user.email}`
        : `Lien généré en local (SMTP non configuré) pour ${user.email}`
    );

    // Message transparent : pas de fausse prétention d'envoi réel si SMTP n'est pas configuré
    const responsePayload = smtpActive
      ? {
          message: 'Si un compte correspond à cette adresse, un lien de réinitialisation vient d\'être envoyé par e-mail.',
          smtpConfigured: true,
        }
      : {
          message: 'Demande enregistrée. (Mode développement : aucun serveur SMTP configuré, le lien direct est affiché dans la console du serveur).',
          smtpConfigured: false,
          devResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
        };

    return res.json(responsePayload);
  } catch (error) {
    console.error('Erreur forgot-password:', error);
    return res.status(500).json({ error: 'Une erreur interne est survenue. Veuillez réessayer ultérieurement.' });
  }
});

// Vérification de la validité d'un token de réinitialisation
authRouter.get('/verify-reset-token/:token', (req, res: Response) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ valid: false, error: 'Token manquant ou invalide.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = db.getPasswordResetToken(tokenHash);

    if (!resetToken) {
      return res.status(400).json({ valid: false, error: 'Ce lien de réinitialisation est invalide ou inexistant.' });
    }

    if (resetToken.used) {
      return res.status(400).json({ valid: false, error: 'Ce lien de réinitialisation a déjà été utilisé.' });
    }

    if (new Date(resetToken.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ valid: false, error: 'Ce lien de réinitialisation a expiré.' });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error('Erreur verify-reset-token:', error);
    return res.status(500).json({ valid: false, error: 'Erreur lors de la vérification du lien.' });
  }
});

// Réinitialisation effective du mot de passe
authRouter.post('/reset-password', (req, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = db.getPasswordResetToken(tokenHash);

    if (!resetToken) {
      return res.status(400).json({ error: 'Ce lien de réinitialisation est invalide ou inexistant.' });
    }

    if (resetToken.used) {
      return res.status(400).json({ error: 'Ce lien de réinitialisation a déjà été utilisé.' });
    }

    if (new Date(resetToken.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Ce lien de réinitialisation a expiré.' });
    }

    // Hashage avec le même mécanisme bcrypt que Relancio (10 rounds)
    const salt = bcrypt.genSaltSync(10);
    const newPasswordHash = bcrypt.hashSync(password, salt);

    // Mise à jour du hash dans le compte
    const updated = db.updateUserPassword(resetToken.user_id, newPasswordHash);
    if (!updated) {
      return res.status(404).json({ error: 'Utilisateur associé introuvable.' });
    }

    // Invalidation immédiate du token pour empêcher toute réutilisation
    db.markPasswordResetTokenAsUsed(tokenHash);

    db.logActivity(null, 'Mot de passe modifié', `Mot de passe réinitialisé avec succès via token sécurisé`);

    return res.json({
      message: 'Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.',
    });
  } catch (error) {
    console.error('Erreur reset-password:', error);
    return res.status(500).json({ error: 'Erreur interne lors de la réinitialisation du mot de passe.' });
  }
});

