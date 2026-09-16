import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireTenant, AuthenticatedRequest } from '../auth.js';
import { Client, Creance, Paiement, ClientType, MoyenPaiement } from '../types.js';

export const companyRouter = Router();

// Apply auth + tenant requirement to all company routes
companyRouter.use(requireAuth);
companyRouter.use(requireTenant);

// ==========================================
// 1. PROFIL DE L'ENTREPRISE
// ==========================================

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

// ==========================================
// 2. CLIENTS (STRICTEMENT ISOLÉS PAR TENANT)
// ==========================================

// Liste des clients
companyRouter.get('/clients', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const tenantId = req.company.id;
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase().trim() : '';
  const includeInactive = req.query.includeInactive === 'true';

  let clients = db.getClientsByEntrepriseId(tenantId, includeInactive);

  if (search) {
    clients = clients.filter(c =>
      c.nom.toLowerCase().includes(search) ||
      c.telephone.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search)
    );
  }

  // Enrichissement de chaque client avec sa synthèse financière
  const enrichedClients = clients.map(client => {
    const summary = db.getClientFinancialSummary(client.id, tenantId);
    return {
      ...client,
      financialSummary: summary,
    };
  });

  return res.json({
    clients: enrichedClients,
    total: enrichedClients.length,
  });
});

// Création d'un client
companyRouter.post('/clients', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const { nom, telephone, email, adresse, type, notes } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ error: 'Le nom ou raison sociale du client est obligatoire' });
  }

  if (!telephone || !telephone.trim()) {
    return res.status(400).json({ error: 'Le numéro de téléphone est obligatoire pour les relances et paiements' });
  }

  const now = new Date().toISOString();
  const newClient: Client = {
    id: 'cli-' + Math.random().toString(36).substring(2, 9),
    entreprise_id: req.company.id,
    type: (type === 'entreprise' ? 'entreprise' : 'particulier') as ClientType,
    nom: nom.trim(),
    telephone: telephone.trim(),
    email: email ? email.trim().toLowerCase() : '',
    adresse: adresse ? adresse.trim() : '',
    notes: notes ? notes.trim() : '',
    actif: true,
    created_at: now,
    updated_at: now,
  };

  const created = db.createClient(newClient);
  db.logActivity(req.company.id, 'Nouveau Client', `Client créé : ${created.nom} (${created.telephone})`);

  return res.status(201).json({
    message: 'Client créé avec succès',
    client: {
      ...created,
      financialSummary: {
        creancesCount: 0,
        totalDue: 0,
        totalPaid: 0,
        balance: 0,
      },
    },
  });
});

// Consultation d'un client avec fiche détaillée et historique
companyRouter.get('/clients/:id', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const client = db.getClientById(req.params.id, req.company.id);
  if (!client) {
    return res.status(404).json({ error: 'Client introuvable ou non autorisé' });
  }

  const summary = db.getClientFinancialSummary(client.id, req.company.id);
  const creances = db.getCreancesByEntrepriseId(req.company.id, { clientId: client.id });
  const paiements = db.getPaiementsByEntrepriseId(req.company.id, { clientId: client.id });

  return res.json({
    client,
    financialSummary: summary,
    creances,
    paiements,
  });
});

// Modification d'un client
companyRouter.put('/clients/:id', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const { nom, telephone, email, adresse, type, notes } = req.body;

  const updates: Partial<Client> = {};
  if (nom !== undefined) updates.nom = nom.trim();
  if (telephone !== undefined) updates.telephone = telephone.trim();
  if (email !== undefined) updates.email = email.trim().toLowerCase();
  if (adresse !== undefined) updates.adresse = adresse.trim();
  if (type !== undefined) updates.type = type === 'entreprise' ? 'entreprise' : 'particulier';
  if (notes !== undefined) updates.notes = notes.trim();

  const updated = db.updateClient(req.params.id, req.company.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Client introuvable ou non autorisé' });
  }

  db.logActivity(req.company.id, 'Modification Client', `Fiche mise à jour pour le client ${updated.nom}`);

  return res.json({
    message: 'Client mis à jour avec succès',
    client: updated,
  });
});

// Activation / Désactivation (soft delete) d'un client
companyRouter.patch('/clients/:id/status', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const { actif } = req.body;
  if (typeof actif !== 'boolean') {
    return res.status(400).json({ error: 'Le champ actif (booléen) est requis' });
  }

  const updated = db.updateClient(req.params.id, req.company.id, { actif });
  if (!updated) {
    return res.status(404).json({ error: 'Client introuvable ou non autorisé' });
  }

  const action = actif ? 'Réactivation Client' : 'Désactivation Client';
  db.logActivity(req.company.id, action, `Le client ${updated.nom} a été ${actif ? 'réactivé' : 'archivé'}`);

  return res.json({
    message: `Client ${actif ? 'réactivé' : 'archivé'} avec succès`,
    client: updated,
  });
});

// ==========================================
// 3. CRÉANCES (STRICTEMENT ISOLÉES PAR TENANT)
// ==========================================

// Liste des créances avec filtres
companyRouter.get('/creances', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const { status, clientId, search } = req.query;

  const creances = db.getCreancesByEntrepriseId(req.company.id, {
    status: typeof status === 'string' ? status : undefined,
    clientId: typeof clientId === 'string' ? clientId : undefined,
    search: typeof search === 'string' ? search : undefined,
  });

  return res.json({
    creances,
    total: creances.length,
  });
});

// Création d'une créance
companyRouter.post('/creances', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const {
    client_id,
    motif,
    description,
    montant_total,
    date_echeance,
    date_creation,
    notes,
  } = req.body;

  // Validation
  if (!client_id) {
    return res.status(400).json({ error: 'Veuillez sélectionner un client pour cette créance' });
  }

  const client = db.getClientById(client_id, req.company.id);
  if (!client) {
    return res.status(400).json({ error: 'Le client sélectionné n\'existe pas ou n\'appartient pas à votre entreprise' });
  }

  if (!motif || !motif.trim()) {
    return res.status(400).json({ error: 'Le motif de la créance est requis' });
  }

  const parsedAmount = Number(montant_total);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Le montant total doit être un nombre supérieur à zéro' });
  }

  if (!date_echeance) {
    return res.status(400).json({ error: 'La date d\'échéance est obligatoire' });
  }

  const now = new Date().toISOString();
  const newCreance: Creance = {
    id: 'cre-' + Math.random().toString(36).substring(2, 9),
    entreprise_id: req.company.id,
    client_id: client.id,
    client_nom: client.nom,
    client_telephone: client.telephone,
    motif: motif.trim(),
    description: description ? description.trim() : motif.trim(),
    montant_total: parsedAmount,
    montant_paye: 0,
    solde: parsedAmount,
    date_creation: date_creation || now.split('T')[0],
    date_echeance,
    statut: 'en_attente',
    notes: notes ? notes.trim() : '',
    montant: parsedAmount,
    echeance: date_echeance,
    created_at: now,
    updated_at: now,
  };

  const created = db.createCreance(newCreance);
  db.logActivity(
    req.company.id,
    'Création Créance',
    `Créance de ${parsedAmount.toLocaleString('fr-FR')} FCFA créée pour ${client.nom} (Motif: ${motif})`
  );

  return res.status(201).json({
    message: 'Créance enregistrée avec succès',
    creance: created,
  });
});

// Consultation d'une créance avec historique des paiements et aperçu lien de paiement
companyRouter.get('/creances/:id', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const creance = db.getCreanceById(req.params.id, req.company.id);
  if (!creance) {
    return res.status(404).json({ error: 'Créance introuvable ou non autorisée' });
  }

  const client = db.getClientById(creance.client_id, req.company.id);
  const paiements = db.getPaiementsByEntrepriseId(req.company.id, { creanceId: creance.id });

  // Informations préparées pour le futur lien de paiement public
  const paymentLinkPreview = {
    companyName: req.company.nom,
    companyLogo: req.company.logo,
    primaryColor: req.company.couleur_principale,
    secondaryColor: req.company.couleur_secondaire,
    clientName: client ? client.nom : creance.client_nom,
    clientPhone: client ? client.telephone : creance.client_telephone,
    motif: creance.motif,
    description: creance.description,
    totalAmount: creance.montant_total,
    paidAmount: creance.montant_paye,
    balance: creance.solde,
    dueDate: creance.date_echeance,
    status: creance.statut,
    paymentUrl: `/pay/${creance.id}`,
  };

  // Préparation de l'emplacement relances
  const remindersSummary = {
    totalRemindersSent: 0,
    lastReminderDate: null,
    nextScheduledReminder: creance.statut === 'en_retard' ? 'Planifiée sous 24h' : null,
    preferredChannel: 'WhatsApp',
  };

  return res.json({
    creance,
    client,
    paiements,
    paymentLinkPreview,
    remindersSummary,
  });
});

// Mise à jour d'une créance
companyRouter.put('/creances/:id', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const { motif, description, date_echeance, notes } = req.body;

  const updates: Partial<Creance> = {};
  if (motif !== undefined) updates.motif = motif.trim();
  if (description !== undefined) updates.description = description.trim();
  if (date_echeance !== undefined) updates.date_echeance = date_echeance;
  if (notes !== undefined) updates.notes = notes.trim();

  const updated = db.updateCreance(req.params.id, req.company.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Créance introuvable ou non autorisée' });
  }

  db.logActivity(req.company.id, 'Modification Créance', `Créance #${updated.id} mise à jour`);

  return res.json({
    message: 'Créance mise à jour avec succès',
    creance: updated,
  });
});

// Enregistrement d'un paiement (partiel ou total)
companyRouter.post('/creances/:id/paiements', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const creance = db.getCreanceById(req.params.id, req.company.id);
  if (!creance) {
    return res.status(404).json({ error: 'Créance introuvable ou non autorisée' });
  }

  const { montant, moyen_paiement, date_paiement, reference, notes } = req.body;

  const parsedAmount = Number(montant);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Le montant du paiement doit être supérieur à zéro' });
  }

  if (parsedAmount > creance.solde) {
    return res.status(400).json({
      error: `Le montant payé (${parsedAmount.toLocaleString('fr-FR')} FCFA) ne peut pas dépasser le solde restant (${creance.solde.toLocaleString('fr-FR')} FCFA)`,
    });
  }

  const now = new Date().toISOString();
  const paiement: Paiement = {
    id: 'pay-' + Math.random().toString(36).substring(2, 9),
    entreprise_id: req.company.id,
    creance_id: creance.id,
    client_id: creance.client_id,
    montant: parsedAmount,
    date_paiement: date_paiement || now.split('T')[0],
    moyen_paiement: (moyen_paiement || 'especes') as MoyenPaiement,
    reference: reference ? reference.trim() : 'ENC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    notes: notes ? notes.trim() : 'Règlement enregistré',
    created_at: now,
  };

  const result = db.recordPaiement(paiement);
  db.logActivity(
    req.company.id,
    'Encaissement Reçu',
    `Paiement de ${parsedAmount.toLocaleString('fr-FR')} FCFA reçu pour la créance #${creance.id} (${creance.client_nom})`
  );

  return res.status(201).json({
    message: 'Paiement enregistré avec succès',
    paiement: result.paiement,
    creance: result.creance,
  });
});

// ==========================================
// 4. PAIEMENTS ENREGISTRÉS
// ==========================================

companyRouter.get('/paiements', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) return res.status(404).json({ error: 'Entreprise introuvable' });

  const paiements = db.getPaiementsByEntrepriseId(req.company.id);

  // Joindre nom du client et motif de créance pour un affichage clair
  const enrichedPaiements = paiements.map(p => {
    const client = db.getClientById(p.client_id, req.company!.id);
    const creance = db.getCreanceById(p.creance_id, req.company!.id);
    return {
      ...p,
      client_nom: client ? client.nom : 'Client',
      client_telephone: client ? client.telephone : '',
      motif_creance: creance ? creance.motif : 'Prestation',
    };
  });

  return res.json({
    paiements: enrichedPaiements,
    total: enrichedPaiements.length,
  });
});

// ==========================================
// 5. DASHBOARD STATISTIQUES RÉELLES
// ==========================================

companyRouter.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  if (!req.company) {
    return res.status(404).json({ error: 'Entreprise introuvable' });
  }

  const tenantId = req.company.id;
  const creances = db.getCreancesByEntrepriseId(tenantId);
  const clients = db.getClientsByEntrepriseId(tenantId);
  const paiements = db.getPaiementsByEntrepriseId(tenantId);
  const activities = db.getActivityLogs(tenantId);

  let totalToRecover = 0;
  let totalCollected = 0;
  let pendingCount = 0;
  let partiallyPaidCount = 0;
  let overdueCount = 0;
  let paidCount = 0;

  const overdueClientIds = new Set<string>();

  for (const c of creances) {
    totalCollected += (c.montant_paye || 0);
    totalToRecover += (c.solde || 0);

    if (c.statut === 'payee') {
      paidCount++;
    } else {
      pendingCount++;
      if (c.statut === 'partiellement_payee') {
        partiallyPaidCount++;
      } else if (c.statut === 'en_retard') {
        overdueCount++;
        if (c.client_id) {
          overdueClientIds.add(c.client_id);
        }
      }
    }
  }

  // Enrichir les derniers paiements
  const recentPayments = paiements.slice(0, 5).map(p => {
    const cli = clients.find(c => c.id === p.client_id);
    const cre = creances.find(c => c.id === p.creance_id);
    return {
      id: p.id,
      client_nom: cli ? cli.nom : 'Client',
      montant: p.montant,
      motif: cre ? cre.motif : 'Règlement créance',
      date_paiement: p.date_paiement,
      moyen_paiement: p.moyen_paiement,
      created_at: p.created_at,
    };
  });

  return res.json({
    company: req.company,
    stats: {
      totalToRecover,
      totalCollected,
      pendingCount,
      partiallyPaidCount,
      overdueCount,
      paidCount,
      clientsToRemindCount: overdueClientIds.size,
      totalClients: clients.length,
      recoveryRate: totalCollected + totalToRecover > 0
        ? Math.round((totalCollected / (totalCollected + totalToRecover)) * 100)
        : 0,
    },
    creances: creances.slice(0, 10),
    recentPayments,
    recentActivities: activities.slice(0, 5),
  });
});
