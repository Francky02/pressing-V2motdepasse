import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../auth.js';

export const adminRouter = Router();

// Apply super admin requirement
adminRouter.use(requireAuth);
adminRouter.use(requireRole(['SUPER_ADMIN']));

// Statistiques globales du Super Admin
adminRouter.get('/stats', (_req: AuthenticatedRequest, res: Response) => {
  const entreprises = db.getEntreprises();
  const users = db.getUsers();
  const activities = db.getActivityLogs();

  const totalCompanies = entreprises.length;
  const activeCompanies = entreprises.filter(e => e.actif).length;
  const inactiveCompanies = totalCompanies - activeCompanies;
  const totalUsers = users.length;

  return res.json({
    totalCompanies,
    activeCompanies,
    inactiveCompanies,
    totalUsers,
    recentActivities: activities.slice(0, 10),
  });
});

// Liste complète des entreprises
adminRouter.get('/companies', (_req: AuthenticatedRequest, res: Response) => {
  const entreprises = db.getEntreprises();
  const users = db.getUsers();

  const companyList = entreprises.map(ent => {
    const adminUser = users.find(u => u.entreprise_id === ent.id && u.role === 'ENTREPRISE_ADMIN');
    return {
      id: ent.id,
      nom: ent.nom,
      responsable: ent.responsable,
      email: ent.email,
      telephone: ent.telephone,
      secteur: ent.secteur,
      logo: ent.logo,
      couleur_principale: ent.couleur_principale,
      couleur_secondaire: ent.couleur_secondaire,
      adresse: ent.adresse,
      actif: ent.actif,
      created_at: ent.created_at,
      adminEmail: adminUser ? adminUser.email : ent.email,
    };
  });

  return res.json({ companies: companyList });
});

// Activer / Désactiver une entreprise
adminRouter.patch('/companies/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { actif } = req.body;

  if (typeof actif !== 'boolean') {
    return res.status(400).json({ error: 'Le statut actif doit être un booléen (true/false).' });
  }

  const existing = db.getEntrepriseById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Entreprise introuvable.' });
  }

  const updated = db.updateEntreprise(id, { actif });
  db.logActivity(
    null,
    'Modification Statut Entreprise',
    `L'entreprise ${existing.nom} a été ${actif ? 'activée' : 'désactivée'} par le Super Admin`
  );

  return res.json({
    message: `Entreprise ${actif ? 'activée' : 'désactivée'} avec succès.`,
    company: updated,
  });
});
