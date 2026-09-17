import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const publicRouter = Router();

// Consultation publique d'une demande de paiement par son token unique
publicRouter.get('/payer/:token', (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token || !token.trim()) {
    return res.status(400).json({ error: 'Token de paiement manquant' });
  }

  const result = db.getDemandePaiementByToken(token.trim());
  if (!result) {
    return res.status(404).json({ error: 'Lien de paiement invalide, expiré ou introuvable.' });
  }

  const { demande, entreprise, client, creance } = result;

  if (!entreprise.actif) {
    return res.status(403).json({ error: 'Ce lien de paiement est temporairement indisponible.' });
  }

  // Sanitized payload for public consumption
  return res.json({
    demande: {
      id: demande.id,
      token: demande.token,
      montant: demande.montant,
      montant_paye: demande.montant_paye || 0,
      motif: demande.motif,
      description: demande.description || '',
      date_creation: demande.date_creation,
      date_expiration: demande.date_expiration,
      statut: demande.statut,
      created_at: demande.created_at,
    },
    company: {
      id: entreprise.id,
      nom: entreprise.nom,
      logo: entreprise.logo,
      couleur_principale: entreprise.couleur_principale || '#10b981',
      couleur_secondaire: entreprise.couleur_secondaire || '#0ea5e9',
      email: entreprise.email,
      telephone: entreprise.telephone,
      adresse: entreprise.adresse,
      secteur: entreprise.secteur,
    },
    client: {
      id: client.id,
      nom: client.nom,
      telephone: client.telephone,
    },
    creance: {
      id: creance.id,
      motif: creance.motif,
      montant_total: creance.montant_total,
      montant_paye: creance.montant_paye,
      solde: creance.solde,
      date_echeance: creance.date_echeance,
      statut: creance.statut,
    },
  });
});
