import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireTenant, AuthenticatedRequest } from '../auth.js';

export const companyRouter = Router();

// Apply auth + tenant requirement to all company routes
companyRouter.use(requireAuth);
companyRouter.use(requireTenant);

// Profil de l'entreprise
companyRouter.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) {
    return res.status(404).json({ error: 'Entreprise introuvable' });
  }
  return res.json({ company: req.company });
});

// Mise à jour du profil et personnalisation
companyRouter.put('/profile', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) {
    return res.status(404).json({ error: 'Entreprise introuvable' });
  }

  const {
    nom,
    secteur,
    telephone,
    email,
    adresse,
    couleur_principale,
    couleur_secondaire,
    logo,
  } = req.body;

  const updates: Record<string, unknown> = {};
  if (nom !== undefined) updates.nom = nom.trim();
  if (secteur !== undefined) updates.secteur = secteur.trim();
  if (telephone !== undefined) updates.telephone = telephone.trim();
  if (email !== undefined) updates.email = email.trim().toLowerCase();
  if (adresse !== undefined) updates.adresse = adresse.trim();
  if (couleur_principale !== undefined) updates.couleur_principale = couleur_principale;
  if (couleur_secondaire !== undefined) updates.couleur_secondaire = couleur_secondaire;
  if (logo !== undefined) updates.logo = logo;

  const updated = db.updateEntreprise(req.company.id, updates);
  db.logActivity(req.company.id, 'Modification Profil', `Mise à jour des paramètres pour ${req.company.nom}`);

  return res.json({
    message: 'Paramètres enregistrés avec succès',
    company: updated,
  });
});

// Suppression du logo
companyRouter.delete('/logo', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) {
    return res.status(404).json({ error: 'Entreprise introuvable' });
  }

  const updated = db.updateEntreprise(req.company.id, { logo: null });
  db.logActivity(req.company.id, 'Suppression Logo', `Logo supprimé pour ${req.company.nom}`);

  return res.json({
    message: 'Logo supprimé avec succès',
    company: updated,
  });
});

// Données du Dashboard Entreprise - STRICTEMENT ISOLÉES PAR TENANT
companyRouter.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) {
    return res.status(404).json({ error: 'Entreprise introuvable' });
  }

  const tenantId = req.company.id;
  // Requête stricte filtrée sur tenantId
  const creances = db.getCreancesByEntrepriseId(tenantId);
  const activities = db.getActivityLogs(tenantId);

  let totalToRecover = 0;
  let totalCollected = 0;
  let pendingCount = 0;
  let remindCount = 0;
  let paidCount = 0;

  for (const c of creances) {
    if (c.statut === 'paye') {
      totalCollected += c.montant;
      paidCount++;
    } else {
      totalToRecover += c.montant;
      if (c.statut === 'relance') {
        remindCount++;
      } else {
        pendingCount++;
      }
    }
  }

  const recentPayments = creances.filter(c => c.statut === 'paye').slice(0, 5);

  return res.json({
    company: req.company,
    stats: {
      totalToRecover,
      totalCollected,
      pendingCount,
      remindCount,
      paidCount,
      recoveryRate: totalCollected + totalToRecover > 0
        ? Math.round((totalCollected / (totalCollected + totalToRecover)) * 100)
        : 0,
    },
    creances,
    recentPayments,
    recentActivities: activities.slice(0, 5),
  });
});
