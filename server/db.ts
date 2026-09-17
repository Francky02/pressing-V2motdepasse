import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  DatabaseSchema,
  User,
  Entreprise,
  Client,
  Creance,
  Paiement,
  ActivityLog,
  CreanceStatut,
  DemandePaiement,
  DemandePaiementStatut,
  RelanceLog,
  RelanceMilestone,
  RelanceStatus,
  RelanceType,
} from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const DEFAULT_RELANCE_MILESTONES: RelanceMilestone[] = ['J-7', 'J-3', 'J0', 'J+3', 'J+7', 'J+14', 'J+30'];

/**
 * Normalise un numéro de téléphone pour WhatsApp au format international (chiffres sans + ni espaces).
 */
export function normalizeWhatsAppPhone(phone: string | null | undefined, defaultCountryCode = '225'): {
  normalized: string;
  isValid: boolean;
  error?: string;
} {
  if (!phone || !phone.trim()) {
    return { normalized: '', isValid: false, error: 'Numéro de téléphone absent' };
  }

  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else {
    // Si commence par 0 et 10 chiffres (Côte d'Ivoire 01/05/07...), on préfixe 225
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = defaultCountryCode + cleaned;
    } else if (cleaned.length <= 9) {
      cleaned = defaultCountryCode + cleaned;
    }
  }

  // Vérifier qu'il y a entre 8 et 15 chiffres
  if (!/^\d{8,15}$/.test(cleaned)) {
    return { normalized: cleaned, isValid: false, error: 'Format de numéro international invalide' };
  }

  return { normalized: cleaned, isValid: true };
}

/**
 * Calcule l'échéance / milestone par rapport à une date de référence
 */
export function calculateMilestone(dateEcheanceStr: string, refDate: Date = new Date()): {
  milestone: RelanceMilestone | null;
  diffDays: number;
} {
  const echeance = parseDueDate(dateEcheanceStr);
  if (!echeance) return { milestone: null, diffDays: 0 };

  const refMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const echMidnight = new Date(echeance.getFullYear(), echeance.getMonth(), echeance.getDate());

  const diffTime = refMidnight.getTime() - echMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let milestone: RelanceMilestone | null = null;
  if (diffDays === -7) milestone = 'J-7';
  else if (diffDays === -3) milestone = 'J-3';
  else if (diffDays === 0) milestone = 'J0';
  else if (diffDays === 3) milestone = 'J+3';
  else if (diffDays === 7) milestone = 'J+7';
  else if (diffDays === 14) milestone = 'J+14';
  else if (diffDays === 30) milestone = 'J+30';

  return { milestone, diffDays };
}

/**
 * Génère le message WhatsApp personnalisé selon l'échéance et le solde restant
 */
export function generateRelanceMessage(
  milestone: RelanceMilestone | 'manuel',
  clientNom: string,
  companyNom: string,
  solde: number,
  motif: string,
  dateEcheance: string,
  tone: 'amicale' | 'ferme' | 'mise_en_demeure' | 'preventif' | 'info' = 'amicale'
): string {
  const amount = solde.toLocaleString('fr-FR');

  switch (milestone) {
    case 'J-7':
      return `Bonjour ${clientNom}, nous vous informons que votre facture pour "${motif}" d'un montant de ${amount} FCFA arrivera à échéance dans 7 jours (le ${dateEcheance}) auprès de ${companyNom}. Merci pour votre anticipation.`;
    case 'J-3':
      return `Bonjour ${clientNom}, rappel courtois : votre règlement de ${amount} FCFA concernant "${motif}" arrive à échéance le ${dateEcheance}. Merci de préparer votre paiement auprès de ${companyNom}.`;
    case 'J0':
      return `Bonjour ${clientNom}, votre facture concernant "${motif}" pour un montant restant de ${amount} FCFA arrive à échéance aujourd'hui (${dateEcheance}). Merci d'effectuer votre règlement auprès de ${companyNom}.`;
    case 'J+3':
      return `Bonjour ${clientNom}, sauf erreur de notre part, votre créance de ${amount} FCFA (${motif}) auprès de ${companyNom} est arrivée à échéance le ${dateEcheance}. Merci de bien vouloir régulariser ce paiement.`;
    case 'J+7':
      return `Rappel important : Bonjour ${clientNom}, nous constatons un retard de paiement de 7 jours pour votre facture "${motif}" (solde : ${amount} FCFA) échue le ${dateEcheance}. Merci de procéder au règlement dans les meilleurs délais. ${companyNom}.`;
    case 'J+14':
      return `AVIS DE RETARD : ${clientNom}, votre facture "${motif}" présente un retard de 14 jours pour un solde de ${amount} FCFA. Nous vous prions de régulariser votre situation sans délai. Contactez ${companyNom}.`;
    case 'J+30':
      return `URGENT - DERNIER AVIS : ${clientNom}, votre impayé de ${amount} FCFA chez ${companyNom} (${motif}) a dépassé 30 jours de retard. Sans règlement sous 48h, votre dossier sera transmis au contentieux.`;
    case 'manuel':
    default:
      if (tone === 'ferme') {
        return `Rappel important : Bonjour ${clientNom}, nous constatons que votre créance de ${amount} FCFA (${motif}) auprès de ${companyNom} n'a pas encore été réglée malgré l'échéance dépassée du ${dateEcheance}. Merci d'effectuer votre paiement dès aujourd'hui.`;
      } else if (tone === 'mise_en_demeure') {
        return `URGENT - DERNIER AVIS : ${clientNom}, votre impayé de ${amount} FCFA chez ${companyNom} pour "${motif}" fait l'objet d'un retard prolongé. Sans règlement sous 48h, votre dossier sera transmis au service contentieux. Contactez-nous immédiatement.`;
      } else if (tone === 'preventif') {
        return `Bonjour ${clientNom}, nous vous rappelons amicalement que votre facture pour "${motif}" (solde : ${amount} FCFA) arrive à échéance le ${dateEcheance}. Merci de préparer votre règlement. Bien cordialement, ${companyNom}.`;
      } else if (tone === 'info') {
        return `Bonjour ${clientNom}, pour information, le règlement de ${amount} FCFA concernant "${motif}" est attendu auprès de ${companyNom} d'ici le ${dateEcheance}. Nous restons à votre disposition pour tout renseignement.`;
      } else {
        return `Bonjour ${clientNom}, sauf erreur de notre part, votre facture concernant "${motif}" pour un montant restant de ${amount} FCFA est arrivée à échéance le ${dateEcheance}. Merci de bien vouloir procéder à son règlement. Cordialement, ${companyNom}.`;
      }
  }
}

export function parseDueDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const str = dateStr.trim();
  // Format DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [day, month, year] = str.split('/').map(Number);
    const d = new Date(year, month - 1, day, 23, 59, 59, 999);
    return isNaN(d.getTime()) ? null : d;
  }
  // Format YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const [year, month, day] = str.split('-').map(Number);
    const d = new Date(year, month - 1, day, 23, 59, 59, 999);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

export function computeCreanceStatus(montantTotal: number, montantPaye: number, dateEcheance: string): CreanceStatut {
  const solde = Math.max(0, Number(montantTotal || 0) - Number(montantPaye || 0));
  if (solde <= 0) {
    return 'payee';
  }

  // Vérification de la date d'échéance (fin de journée)
  if (dateEcheance) {
    const echeanceDate = parseDueDate(dateEcheance);
    if (echeanceDate && echeanceDate.getTime() < Date.now()) {
      return 'en_retard';
    }
  }

  if (Number(montantPaye || 0) > 0) {
    return 'partiellement_payee';
  }

  return 'en_attente';
}

export function computeDemandePaiementStatus(
  statut: DemandePaiementStatut,
  dateExpiration: string,
  montant: number,
  montantPaye: number
): DemandePaiementStatut {
  if (statut === 'annulee') {
    return 'annulee';
  }
  if (montantPaye >= montant && montant > 0) {
    return 'payee';
  }
  if (dateExpiration) {
    const expDate = new Date(dateExpiration);
    expDate.setHours(23, 59, 59, 999);
    if (!isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
      return 'expiree';
    }
  }
  if (montantPaye > 0) {
    return 'partiellement_payee';
  }
  return 'en_attente';
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    entreprises: [],
    clients: [],
    creances: [],
    paiements: [],
    demandes_paiement: [],
    relances_logs: [],
    activity_logs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          entreprises: parsed.entreprises || [],
          clients: parsed.clients || [],
          creances: parsed.creances || [],
          paiements: parsed.paiements || [],
          demandes_paiement: parsed.demandes_paiement || [],
          relances_logs: parsed.relances_logs || [],
          activity_logs: parsed.activity_logs || [],
        };
        this.migrateAndSync();
      } catch (err) {
        console.error('Erreur lecture db.json, réinitialisation...', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  /**
   * Assure la rétrocompatibilité des créances existantes et l'existence des tables clients & paiements
   */
  private migrateAndSync() {
    let modified = false;

    // Si aucun client n'existe, on injecte les clients initiaux
    if (this.data.clients.length === 0) {
      const now = new Date().toISOString();
      const initialClients: Client[] = [
        {
          id: 'cli-rc-01',
          entreprise_id: 'ent-royal-clean',
          type: 'particulier',
          nom: 'M. Kouamé Patrice',
          telephone: '+225 05 11 22 33',
          email: 'patrice.kouame@example.com',
          adresse: 'Abidjan, Cocody Angré 8ème Tranche',
          notes: 'Client fidèle pressing costume haute couture',
          actif: true,
          created_at: now,
          updated_at: now,
        },
        {
          id: 'cli-rc-02',
          entreprise_id: 'ent-royal-clean',
          type: 'entreprise',
          nom: 'Hôtel Ivoire Palace',
          telephone: '+225 07 99 88 77',
          email: 'facturation@ivoirepalace.ci',
          adresse: 'Abidjan, Plateau Boulevard de la République',
          notes: 'Contrat hôtelier lot linge hebdomadaire',
          actif: true,
          created_at: now,
          updated_at: now,
        },
        {
          id: 'cli-rc-03',
          entreprise_id: 'ent-royal-clean',
          type: 'particulier',
          nom: 'Mme Bamba Awa',
          telephone: '+225 01 44 55 66',
          email: 'awa.bamba@example.com',
          adresse: 'Abidjan, Marcory Zone 4',
          notes: 'Client robes de cérémonies',
          actif: true,
          created_at: now,
          updated_at: now,
        },
        {
          id: 'cli-ee-01',
          entreprise_id: 'ent-etoiles-ecole',
          type: 'particulier',
          nom: 'M. Sarr Amadou (Parent élève)',
          telephone: '+221 77 123 45 67',
          email: 'amadou.sarr@example.sn',
          adresse: 'Dakar, Liberté 6',
          notes: 'Parent élève Sarr Ibrahima (Classe 3ème B)',
          actif: true,
          created_at: now,
          updated_at: now,
        },
        {
          id: 'cli-ee-02',
          entreprise_id: 'ent-etoiles-ecole',
          type: 'particulier',
          nom: 'Mme Ndiaye Mariama',
          telephone: '+221 78 987 65 43',
          email: 'mariama.ndiaye@example.sn',
          adresse: 'Dakar, Mermoz',
          notes: 'Parent élève Ndiaye Fatou (Primaire CE2)',
          actif: true,
          created_at: now,
          updated_at: now,
        },
        {
          id: 'cli-ee-03',
          entreprise_id: 'ent-etoiles-ecole',
          type: 'particulier',
          nom: 'M. Kane Ousmane',
          telephone: '+221 70 555 44 33',
          email: 'ousmane.kane@example.sn',
          adresse: 'Dakar, Ouakam',
          notes: 'Parent élève Kane Abdoulaye (Terminale S)',
          actif: true,
          created_at: now,
          updated_at: now,
        },
      ];
      this.data.clients = initialClients;
      modified = true;
    }

    // Migration des créances
    for (const c of this.data.creances) {
      // Montants & soldes
      if (c.montant_total === undefined) {
        c.montant_total = c.montant || 0;
        modified = true;
      }
      if (c.montant_paye === undefined) {
        c.montant_paye = c.statut === ('paye' as unknown) ? c.montant_total : 0;
        modified = true;
      }
      if (c.solde === undefined) {
        c.solde = Math.max(0, c.montant_total - c.montant_paye);
        modified = true;
      }
      if (!c.date_creation) {
        c.date_creation = c.created_at || new Date().toISOString();
        modified = true;
      }
      if (!c.date_echeance) {
        c.date_echeance = c.echeance || new Date().toISOString().split('T')[0];
        modified = true;
      }
      if (!c.description) {
        c.description = c.motif || '';
        modified = true;
      }
      if (!c.notes) {
        c.notes = '';
      }
      if (!c.updated_at) {
        c.updated_at = c.created_at || new Date().toISOString();
        modified = true;
      }

      // Liaison avec client_id si manquant
      if (!c.client_id) {
        const matchingClient = this.data.clients.find(
          cli => cli.entreprise_id === c.entreprise_id && cli.nom.toLowerCase() === (c.client_nom || '').toLowerCase()
        );
        if (matchingClient) {
          c.client_id = matchingClient.id;
        } else {
          // Créer un client pour cette créance
          const newClientId = 'cli-' + Math.random().toString(36).substring(2, 9);
          const newCli: Client = {
            id: newClientId,
            entreprise_id: c.entreprise_id,
            type: 'particulier',
            nom: c.client_nom || 'Client sans nom',
            telephone: c.client_telephone || '',
            email: '',
            adresse: '',
            notes: 'Généré automatiquement depuis créance',
            actif: true,
            created_at: c.created_at || new Date().toISOString(),
            updated_at: c.created_at || new Date().toISOString(),
          };
          this.data.clients.push(newCli);
          c.client_id = newClientId;
        }
        modified = true;
      }

      // Synchronisation du statut
      const newStatus = computeCreanceStatus(c.montant_total, c.montant_paye, c.date_echeance);
      if (c.statut !== newStatus) {
        c.statut = newStatus;
        modified = true;
      }

      // Garantir compatibilité ascendante pour l'ancien code qui lirait c.montant ou c.echeance
      c.montant = c.montant_total;
      c.echeance = c.date_echeance;
    }

    // Initialisation des paiements si vide
    if (this.data.paiements.length === 0) {
      const now = new Date().toISOString();
      // Créer paiements pour les créances déjà payées
      for (const c of this.data.creances) {
        if (c.montant_paye > 0) {
          this.data.paiements.push({
            id: 'pay-' + Math.random().toString(36).substring(2, 9),
            entreprise_id: c.entreprise_id,
            creance_id: c.id,
            client_id: c.client_id,
            montant: c.montant_paye,
            date_paiement: c.date_echeance || now,
            moyen_paiement: 'especes',
            reference: 'ENC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            notes: 'Règlement initial enregistré',
            created_at: now,
          });
          modified = true;
        }
      }
    }

    // Initialisation des demandes de paiement si vide
    if (!this.data.demandes_paiement) {
      this.data.demandes_paiement = [];
      modified = true;
    }

    if (this.data.demandes_paiement.length === 0 && this.data.creances.length > 0) {
      const now = new Date().toISOString();
      const expDate = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0];
      const rcCreances = this.data.creances.filter(c => c.entreprise_id === 'ent-royal-clean');
      if (rcCreances.length > 0) {
        this.data.demandes_paiement.push({
          id: 'dem-rc-01',
          entreprise_id: 'ent-royal-clean',
          creance_id: rcCreances[0].id,
          client_id: rcCreances[0].client_id,
          montant: rcCreances[0].solde > 0 ? rcCreances[0].solde : rcCreances[0].montant_total,
          montant_paye: 0,
          motif: `Lien de paiement - ${rcCreances[0].motif}`,
          token: 'pay_rc_7a9f2b1c4e',
          date_creation: now.split('T')[0],
          date_expiration: expDate,
          statut: 'en_attente',
          description: rcCreances[0].description,
          created_at: now,
          updated_at: now,
        });
        modified = true;
      }
    }

    if (modified) {
      this.save();
    }
  }

  private seedInitialData() {
    console.log('Seeding initial Relancio database with clients & créances...');
    const salt = bcrypt.genSaltSync(10);
    const superAdminHash = bcrypt.hashSync('AdminRelancio2026!', salt);
    const companyPasswordHash = bcrypt.hashSync('Password123!', salt);

    const now = new Date().toISOString();

    const entreprises: Entreprise[] = [
      {
        id: 'ent-royal-clean',
        nom: 'Pressing Royal Clean',
        responsable: 'Kouassi Jean-Marc',
        email: 'royalclean@example.com',
        telephone: '+225 07 88 99 12',
        secteur: 'Pressing',
        logo: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230284c7'/><path d='M30 70 C30 50, 50 35, 50 25 C50 35, 70 50, 70 70 C70 81, 61 90, 50 90 C39 90, 30 81, 30 70 Z' fill='white'/><circle cx='50' cy='62' r='8' fill='%2338bdf8'/></svg>",
        couleur_principale: '#0ea5e9',
        couleur_secondaire: '#0284c7',
        adresse: 'Abidjan, Cocody Riviera Palmeraie',
        actif: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'ent-etoiles-ecole',
        nom: 'Groupe Scolaire Les Étoiles',
        responsable: 'Fatou Diallo',
        email: 'etoiles@example.com',
        telephone: '+221 33 824 55 66',
        secteur: 'École',
        logo: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23059669'/><path d='M50 20 L80 35 L50 50 L20 35 Z' fill='white'/><path d='M30 45 L30 65 C30 72, 50 80, 50 80 C50 80, 70 72, 70 65 L70 45' stroke='white' stroke-width='6' fill='none'/></svg>",
        couleur_principale: '#10b981',
        couleur_secondaire: '#059669',
        adresse: 'Dakar, Almadies',
        actif: true,
        created_at: now,
        updated_at: now,
      },
    ];

    const users: User[] = [
      {
        id: 'user-super-admin',
        entreprise_id: null,
        nom: 'Super Administrateur Relancio',
        email: 'admin@relancio.com',
        telephone: '+225 00 00 00 00',
        password_hash: superAdminHash,
        role: 'SUPER_ADMIN',
        actif: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user-royal-clean',
        entreprise_id: 'ent-royal-clean',
        nom: 'Kouassi Jean-Marc',
        email: 'royalclean@example.com',
        telephone: '+225 07 88 99 12',
        password_hash: companyPasswordHash,
        role: 'ENTREPRISE_ADMIN',
        actif: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user-etoiles-ecole',
        entreprise_id: 'ent-etoiles-ecole',
        nom: 'Fatou Diallo',
        email: 'etoiles@example.com',
        telephone: '+221 33 824 55 66',
        password_hash: companyPasswordHash,
        role: 'ENTREPRISE_ADMIN',
        actif: true,
        created_at: now,
        updated_at: now,
      },
    ];

    const clients: Client[] = [
      {
        id: 'cli-rc-01',
        entreprise_id: 'ent-royal-clean',
        type: 'particulier',
        nom: 'M. Kouamé Patrice',
        telephone: '+225 05 11 22 33',
        email: 'patrice.kouame@example.com',
        adresse: 'Abidjan, Cocody Angré 8ème Tranche',
        notes: 'Client régulier, pressing costumes',
        actif: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cli-rc-02',
        entreprise_id: 'ent-royal-clean',
        type: 'entreprise',
        nom: 'Hôtel Ivoire Palace',
        telephone: '+225 07 99 88 77',
        email: 'facturation@ivoirepalace.ci',
        adresse: 'Abidjan, Plateau Boulevard de la République',
        notes: 'Partenaire hôtelier B2B',
        actif: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cli-rc-03',
        entreprise_id: 'ent-royal-clean',
        type: 'particulier',
        nom: 'Mme Bamba Awa',
        telephone: '+225 01 44 55 66',
        email: 'awa.bamba@example.com',
        adresse: 'Abidjan, Marcory Zone 4',
        notes: 'Robe de soirée soie',
        actif: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cli-ee-01',
        entreprise_id: 'ent-etoiles-ecole',
        type: 'particulier',
        nom: 'M. Sarr Amadou (Parent élève)',
        telephone: '+221 77 123 45 67',
        email: 'amadou.sarr@example.sn',
        adresse: 'Dakar, Liberté 6',
        notes: 'Parent élève Sarr Ibrahima (Classe 3ème B)',
        actif: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cli-ee-02',
        entreprise_id: 'ent-etoiles-ecole',
        type: 'particulier',
        nom: 'Mme Ndiaye Mariama',
        telephone: '+221 78 987 65 43',
        email: 'mariama.ndiaye@example.sn',
        adresse: 'Dakar, Mermoz',
        notes: 'Parent élève Ndiaye Fatou',
        actif: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cli-ee-03',
        entreprise_id: 'ent-etoiles-ecole',
        type: 'particulier',
        nom: 'M. Kane Ousmane',
        telephone: '+221 70 555 44 33',
        email: 'ousmane.kane@example.sn',
        adresse: 'Dakar, Ouakam',
        notes: 'Parent élève Kane Abdoulaye (Terminale S)',
        actif: true,
        created_at: now,
        updated_at: now,
      },
    ];

    const creances: Creance[] = [
      {
        id: 'cre-rc-01',
        entreprise_id: 'ent-royal-clean',
        client_id: 'cli-rc-01',
        client_nom: 'M. Kouamé Patrice',
        client_telephone: '+225 05 11 22 33',
        motif: 'Nettoyage 4 costumes 3 pièces + 6 chemises',
        description: 'Prestation pressing haute finition',
        montant_total: 45000,
        montant_paye: 0,
        solde: 45000,
        date_creation: '2026-09-01',
        date_echeance: '2026-09-20',
        statut: 'en_attente',
        notes: 'Relance WhatsApp programmée',
        montant: 45000,
        echeance: '2026-09-20',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cre-rc-02',
        entreprise_id: 'ent-royal-clean',
        client_id: 'cli-rc-02',
        client_nom: 'Hôtel Ivoire Palace',
        client_telephone: '+225 07 99 88 77',
        motif: 'Lavage linge hôtelier de luxe lot #B4',
        description: 'Traitement anti-acariens draps et serviettes',
        montant_total: 280000,
        montant_paye: 80000,
        solde: 200000,
        date_creation: '2026-09-05',
        date_echeance: '2026-09-25',
        statut: 'partiellement_payee',
        notes: 'Acompte de 80 000 FCFA versé par virement',
        montant: 280000,
        echeance: '2026-09-25',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cre-rc-03',
        entreprise_id: 'ent-royal-clean',
        client_id: 'cli-rc-03',
        client_nom: 'Mme Bamba Awa',
        client_telephone: '+225 01 44 55 66',
        motif: 'Détachage robe de soirée en soie',
        description: 'Nettoyage délicat à sec',
        montant_total: 35000,
        montant_paye: 35000,
        solde: 0,
        date_creation: '2026-09-02',
        date_echeance: '2026-09-12',
        statut: 'payee',
        notes: 'Payé en espèces lors du retrait',
        montant: 35000,
        echeance: '2026-09-12',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cre-ee-01',
        entreprise_id: 'ent-etoiles-ecole',
        client_id: 'cli-ee-01',
        client_nom: 'M. Sarr Amadou (Parent élève)',
        client_telephone: '+221 77 123 45 67',
        motif: 'Frais de scolarité Trimestre 2 - Classe 3ème B',
        description: 'Écolage et fournitures pédagogiques',
        montant_total: 150000,
        montant_paye: 50000,
        solde: 100000,
        date_creation: '2026-09-01',
        date_echeance: '2026-09-18',
        statut: 'partiellement_payee',
        notes: 'Premier versement 50 000 FCFA effectué',
        montant: 150000,
        echeance: '2026-09-18',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cre-ee-02',
        entreprise_id: 'ent-etoiles-ecole',
        client_id: 'cli-ee-02',
        client_nom: 'Mme Ndiaye Mariama',
        client_telephone: '+221 78 987 65 43',
        motif: 'Transport scolaire & cantine Septembre',
        description: 'Abonnement mensuel bus scolaire',
        montant_total: 85000,
        montant_paye: 0,
        solde: 85000,
        date_creation: '2026-09-03',
        date_echeance: '2026-09-30',
        statut: 'en_attente',
        notes: 'Facture transmise par WhatsApp',
        montant: 85000,
        echeance: '2026-09-30',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cre-ee-03',
        entreprise_id: 'ent-etoiles-ecole',
        client_id: 'cli-ee-03',
        client_nom: 'M. Kane Ousmane',
        client_telephone: '+221 70 555 44 33',
        motif: 'Frais de scolarité Trimestre 1 - Classe Terminale S',
        description: 'Scolarité complète réglée',
        montant_total: 150000,
        montant_paye: 150000,
        solde: 0,
        date_creation: '2026-08-25',
        date_echeance: '2026-09-05',
        statut: 'payee',
        notes: 'Règlement total validé',
        montant: 150000,
        echeance: '2026-09-05',
        created_at: now,
        updated_at: now,
      },
    ];

    const paiements: Paiement[] = [
      {
        id: 'pay-rc-01',
        entreprise_id: 'ent-royal-clean',
        creance_id: 'cre-rc-02',
        client_id: 'cli-rc-02',
        montant: 80000,
        date_paiement: '2026-09-08',
        moyen_paiement: 'virement',
        reference: 'VIR-PALACE-80K',
        notes: 'Acompte 80 000 FCFA sur facture linge #B4',
        created_at: now,
      },
      {
        id: 'pay-rc-02',
        entreprise_id: 'ent-royal-clean',
        creance_id: 'cre-rc-03',
        client_id: 'cli-rc-03',
        montant: 35000,
        date_paiement: '2026-09-12',
        moyen_paiement: 'especes',
        reference: 'ESP-ROBE-35K',
        notes: 'Règlement comptant au guichet',
        created_at: now,
      },
      {
        id: 'pay-ee-01',
        entreprise_id: 'ent-etoiles-ecole',
        creance_id: 'cre-ee-01',
        client_id: 'cli-ee-01',
        montant: 50000,
        date_paiement: '2026-09-10',
        moyen_paiement: 'wave',
        reference: 'WAVE-SARR-50K',
        notes: 'Premier acompte scolarité Trimestre 2',
        created_at: now,
      },
      {
        id: 'pay-ee-02',
        entreprise_id: 'ent-etoiles-ecole',
        creance_id: 'cre-ee-03',
        client_id: 'cli-ee-03',
        montant: 150000,
        date_paiement: '2026-09-05',
        moyen_paiement: 'om',
        reference: 'OM-KANE-150K',
        notes: 'Règlement total Trimestre 1 Terminale S',
        created_at: now,
      },
    ];

    const activity_logs: ActivityLog[] = [
      {
        id: 'act-01',
        entreprise_id: 'ent-royal-clean',
        action: 'Relance envoyée',
        details: 'Demande de paiement envoyée à M. Kouamé Patrice (45 000 FCFA)',
        created_at: now,
      },
      {
        id: 'act-02',
        entreprise_id: 'ent-etoiles-ecole',
        action: 'Paiement reçu',
        details: 'Encaissement validé 50 000 FCFA pour M. Sarr Amadou',
        created_at: now,
      },
      {
        id: 'act-03',
        entreprise_id: null,
        action: 'Création compte',
        details: 'Plateforme Relancio initialisée avec succès',
        created_at: now,
      },
    ];

    this.data = {
      users,
      entreprises,
      clients,
      creances,
      paiements,
      activity_logs,
    };

    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erreur écriture db.json:', err);
    }
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  // --- Entreprises ---
  public getEntreprises(): Entreprise[] {
    return this.data.entreprises;
  }

  public getEntrepriseById(id: string): Entreprise | undefined {
    return this.data.entreprises.find(e => e.id === id);
  }

  public getEntrepriseByEmail(email: string): Entreprise | undefined {
    return this.data.entreprises.find(e => e.email.toLowerCase() === email.toLowerCase());
  }

  public createEntreprise(entreprise: Entreprise): Entreprise {
    this.data.entreprises.push(entreprise);
    this.save();
    return entreprise;
  }

  public updateEntreprise(id: string, updates: Partial<Entreprise>): Entreprise | undefined {
    const idx = this.data.entreprises.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    this.data.entreprises[idx] = {
      ...this.data.entreprises[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.entreprises[idx];
  }

  // --- Clients (STRICTEMENT ISOLÉS PAR TENANT) ---
  public getClientsByEntrepriseId(entrepriseId: string, includeInactive = false): Client[] {
    return this.data.clients.filter(c => c.entreprise_id === entrepriseId && (includeInactive || c.actif));
  }

  public getClientById(id: string, entrepriseId: string): Client | undefined {
    return this.data.clients.find(c => c.id === id && c.entreprise_id === entrepriseId);
  }

  public createClient(client: Client): Client {
    this.data.clients.unshift(client);
    this.save();
    return client;
  }

  public updateClient(id: string, entrepriseId: string, updates: Partial<Client>): Client | undefined {
    const idx = this.data.clients.findIndex(c => c.id === id && c.entreprise_id === entrepriseId);
    if (idx === -1) return undefined;

    this.data.clients[idx] = {
      ...this.data.clients[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Mettre à jour aussi le nom et tél des créances associées si le nom a changé
    if (updates.nom || updates.telephone) {
      for (const creance of this.data.creances) {
        if (creance.client_id === id && creance.entreprise_id === entrepriseId) {
          if (updates.nom) creance.client_nom = updates.nom;
          if (updates.telephone) creance.client_telephone = updates.telephone;
        }
      }
    }

    this.save();
    return this.data.clients[idx];
  }

  public getClientFinancialSummary(clientId: string, entrepriseId: string) {
    const creances = this.data.creances.filter(c => c.client_id === clientId && c.entreprise_id === entrepriseId);
    let totalDue = 0;
    let totalPaid = 0;
    let balance = 0;

    for (const c of creances) {
      totalDue += c.montant_total;
      totalPaid += c.montant_paye;
      balance += c.solde;
    }

    return {
      creancesCount: creances.length,
      totalDue,
      totalPaid,
      balance,
    };
  }

  // --- Créances (STRICTEMENT ISOLÉES PAR TENANT) ---
  public getCreancesByEntrepriseId(
    entrepriseId: string,
    filter?: { status?: string; clientId?: string; search?: string }
  ): Creance[] {
    let list = this.data.creances.filter(c => c.entreprise_id === entrepriseId);

    // Mettre à jour les soldes et statuts en temps réel pour tenir compte de la date d'échéance et des paiements
    for (const c of list) {
      c.solde = Math.max(0, Number(c.montant_total || 0) - Number(c.montant_paye || 0));
      const computed = computeCreanceStatus(c.montant_total, c.montant_paye || 0, c.date_echeance);
      if (c.statut !== computed) {
        c.statut = computed;
      }
    }

    if (filter?.status && filter.status !== 'toutes') {
      list = list.filter(c => c.statut === filter.status);
    }

    if (filter?.clientId) {
      list = list.filter(c => c.client_id === filter.clientId);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        c =>
          (c.client_nom && c.client_nom.toLowerCase().includes(q)) ||
          (c.motif && c.motif.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Synthèse et classification des relances (en retard vs à venir vs soldées)
   * Strictement isolée par entreprise (tenant)
   */
  public getRelancesByEntrepriseId(entrepriseId: string) {
    const allCreances = this.getCreancesByEntrepriseId(entrepriseId);
    const overdue: Creance[] = [];
    const upcoming: Creance[] = [];
    const allUnpaid: Creance[] = [];
    const upToDate: Creance[] = [];

    let totalOverdueAmount = 0;
    let totalUpcomingAmount = 0;
    let totalUnpaidAmount = 0;
    let totalPaidAmount = 0;

    const overdueClientIds = new Set<string>();
    const upcomingClientIds = new Set<string>();
    const allUnpaidClientIds = new Set<string>();

    for (const c of allCreances) {
      const solde = Math.max(0, Number(c.montant_total || 0) - Number(c.montant_paye || 0));
      c.solde = solde;

      if (solde === 0) {
        upToDate.push(c);
        totalPaidAmount += Number(c.montant_paye || 0);
      } else {
        allUnpaid.push(c);
        totalUnpaidAmount += solde;
        allUnpaidClientIds.add(c.client_id);

        if (c.statut === 'en_retard') {
          overdue.push(c);
          totalOverdueAmount += solde;
          overdueClientIds.add(c.client_id);
        } else {
          // Solde > 0 et date d'échéance non dépassée (en_attente ou partiellement_payee)
          upcoming.push(c);
          totalUpcomingAmount += solde;
          upcomingClientIds.add(c.client_id);
        }
      }
    }

    return {
      overdue,
      upcoming,
      allUnpaid,
      upToDate,
      summary: {
        totalOverdueAmount,
        totalUpcomingAmount,
        totalUnpaidAmount,
        totalPaidAmount,
        overdueCount: overdue.length,
        upcomingCount: upcoming.length,
        allUnpaidCount: allUnpaid.length,
        upToDateCount: upToDate.length,
        overdueClientsCount: overdueClientIds.size,
        upcomingClientsCount: upcomingClientIds.size,
        totalUnpaidClientsCount: allUnpaidClientIds.size,
        isFullyUpToDate: allUnpaid.length === 0,
      },
    };
  }

  public getCreanceById(id: string, entrepriseId: string): Creance | undefined {
    const c = this.data.creances.find(item => item.id === id && item.entreprise_id === entrepriseId);
    if (c) {
      const computed = computeCreanceStatus(c.montant_total, c.montant_paye, c.date_echeance);
      if (c.statut !== computed) {
        c.statut = computed;
        this.save();
      }
    }
    return c;
  }

  public createCreance(creance: Creance): Creance {
    // Calcul automatique du solde et statut initial
    creance.solde = Math.max(0, creance.montant_total - (creance.montant_paye || 0));
    creance.statut = computeCreanceStatus(creance.montant_total, creance.montant_paye || 0, creance.date_echeance);
    creance.montant = creance.montant_total;
    creance.echeance = creance.date_echeance;

    this.data.creances.unshift(creance);
    this.save();
    return creance;
  }

  public updateCreance(id: string, entrepriseId: string, updates: Partial<Creance>): Creance | undefined {
    const idx = this.data.creances.findIndex(c => c.id === id && c.entreprise_id === entrepriseId);
    if (idx === -1) return undefined;

    const existing = this.data.creances[idx];
    const newMontantTotal = updates.montant_total !== undefined ? updates.montant_total : existing.montant_total;
    const newMontantPaye = updates.montant_paye !== undefined ? updates.montant_paye : existing.montant_paye;
    const newDateEcheance = updates.date_echeance !== undefined ? updates.date_echeance : existing.date_echeance;
    const newSolde = Math.max(0, newMontantTotal - newMontantPaye);
    const newStatut = computeCreanceStatus(newMontantTotal, newMontantPaye, newDateEcheance);

    this.data.creances[idx] = {
      ...existing,
      ...updates,
      montant_total: newMontantTotal,
      montant_paye: newMontantPaye,
      solde: newSolde,
      date_echeance: newDateEcheance,
      statut: newStatut,
      montant: newMontantTotal,
      echeance: newDateEcheance,
      updated_at: new Date().toISOString(),
    };

    this.save();
    return this.data.creances[idx];
  }

  // --- Paiements (STRICTEMENT ISOLÉS PAR TENANT) ---
  public getPaiementsByEntrepriseId(
    entrepriseId: string,
    filter?: { creanceId?: string; clientId?: string }
  ): Paiement[] {
    let list = this.data.paiements.filter(p => p.entreprise_id === entrepriseId);
    if (filter?.creanceId) {
      list = list.filter(p => p.creance_id === filter.creanceId);
    }
    if (filter?.clientId) {
      list = list.filter(p => p.client_id === filter.clientId);
    }
    return list.sort((a, b) => new Date(b.date_paiement).getTime() - new Date(a.date_paiement).getTime());
  }

  public recordPaiement(paiement: Paiement): { paiement: Paiement; creance: Creance } {
    // 1. Enregistrer le paiement
    this.data.paiements.unshift(paiement);

    // 2. Mettre à jour la créance associée
    const creanceIdx = this.data.creances.findIndex(
      c => c.id === paiement.creance_id && c.entreprise_id === paiement.entreprise_id
    );
    if (creanceIdx === -1) {
      throw new Error('Créance introuvable pour ce paiement');
    }

    const c = this.data.creances[creanceIdx];
    const newMontantPaye = (c.montant_paye || 0) + paiement.montant;
    const newSolde = Math.max(0, c.montant_total - newMontantPaye);
    const newStatut = computeCreanceStatus(c.montant_total, newMontantPaye, c.date_echeance);

    this.data.creances[creanceIdx] = {
      ...c,
      montant_paye: newMontantPaye,
      solde: newSolde,
      statut: newStatut,
      updated_at: new Date().toISOString(),
    };

    // 3. Mettre à jour les demandes de paiement associées à cette créance
    if (this.data.demandes_paiement) {
      for (const d of this.data.demandes_paiement) {
        if (d.creance_id === paiement.creance_id && d.entreprise_id === paiement.entreprise_id && d.statut !== 'annulee') {
          const demPaye = (d.montant_paye || 0) + paiement.montant;
          d.montant_paye = demPaye;
          d.statut = computeDemandePaiementStatus(d.statut, d.date_expiration, d.montant, demPaye);
          d.updated_at = new Date().toISOString();
        }
      }
    }

    this.save();
    return {
      paiement,
      creance: this.data.creances[creanceIdx],
    };
  }

  // --- Demandes de paiement & Liens publics (STRICTEMENT ISOLÉS PAR TENANT) ---
  public getDemandesPaiementByEntrepriseId(
    entrepriseId: string,
    filter?: { creanceId?: string; clientId?: string; statut?: string }
  ): (DemandePaiement & { client_nom?: string; client_telephone?: string; motif_creance?: string; creance_statut?: string })[] {
    if (!this.data.demandes_paiement) this.data.demandes_paiement = [];
    let list = this.data.demandes_paiement.filter(d => d.entreprise_id === entrepriseId);

    // Mise à jour dynamique des statuts (expiration, paiements)
    let hasUpdated = false;
    list = list.map(d => {
      const computed = computeDemandePaiementStatus(
        d.statut,
        d.date_expiration,
        d.montant,
        d.montant_paye || 0
      );
      if (d.statut !== computed && d.statut !== 'annulee' && d.statut !== 'payee') {
        d.statut = computed;
        hasUpdated = true;
      }
      return d;
    });

    if (hasUpdated) {
      this.save();
    }

    if (filter?.creanceId) {
      list = list.filter(d => d.creance_id === filter.creanceId);
    }
    if (filter?.clientId) {
      list = list.filter(d => d.client_id === filter.clientId);
    }
    if (filter?.statut && filter.statut !== 'toutes') {
      list = list.filter(d => d.statut === filter.statut);
    }

    return list.map(demande => {
      const client = this.getClientById(demande.client_id, entrepriseId);
      const creance = this.getCreanceById(demande.creance_id, entrepriseId);
      return {
        ...demande,
        client_nom: client ? client.nom : 'Client inconnu',
        client_telephone: client ? client.telephone : '',
        motif_creance: creance ? creance.motif : demande.motif,
        creance_statut: creance ? creance.statut : 'en_attente',
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getDemandePaiementById(id: string, entrepriseId: string): DemandePaiement | undefined {
    if (!this.data.demandes_paiement) this.data.demandes_paiement = [];
    const d = this.data.demandes_paiement.find(item => item.id === id && item.entreprise_id === entrepriseId);
    if (d) {
      const computed = computeDemandePaiementStatus(d.statut, d.date_expiration, d.montant, d.montant_paye || 0);
      if (d.statut !== computed && d.statut !== 'annulee' && d.statut !== 'payee') {
        d.statut = computed;
        this.save();
      }
    }
    return d;
  }

  public getDemandePaiementByToken(token: string): {
    demande: DemandePaiement;
    entreprise: Entreprise;
    client: Client;
    creance: Creance;
  } | undefined {
    if (!this.data.demandes_paiement) this.data.demandes_paiement = [];
    const demande = this.data.demandes_paiement.find(d => d.token === token);
    if (!demande) return undefined;

    const computed = computeDemandePaiementStatus(
      demande.statut,
      demande.date_expiration,
      demande.montant,
      demande.montant_paye || 0
    );
    if (demande.statut !== computed && demande.statut !== 'annulee' && demande.statut !== 'payee') {
      demande.statut = computed;
      this.save();
    }

    const entreprise = this.getEntrepriseById(demande.entreprise_id);
    if (!entreprise) return undefined;

    const client = this.getClientById(demande.client_id, demande.entreprise_id);
    if (!client) return undefined;

    const creance = this.getCreanceById(demande.creance_id, demande.entreprise_id);
    if (!creance) return undefined;

    return {
      demande,
      entreprise,
      client,
      creance,
    };
  }

  public createDemandePaiement(demande: DemandePaiement): DemandePaiement {
    if (!this.data.demandes_paiement) this.data.demandes_paiement = [];

    demande.statut = computeDemandePaiementStatus(
      demande.statut || 'en_attente',
      demande.date_expiration,
      demande.montant,
      demande.montant_paye || 0
    );

    this.data.demandes_paiement.unshift(demande);
    this.save();
    return demande;
  }

  public updateDemandePaiement(id: string, entrepriseId: string, updates: Partial<DemandePaiement>): DemandePaiement | undefined {
    if (!this.data.demandes_paiement) this.data.demandes_paiement = [];
    const idx = this.data.demandes_paiement.findIndex(d => d.id === id && d.entreprise_id === entrepriseId);
    if (idx === -1) return undefined;

    const existing = this.data.demandes_paiement[idx];
    const newMontant = updates.montant !== undefined ? updates.montant : existing.montant;
    const newMontantPaye = updates.montant_paye !== undefined ? updates.montant_paye : (existing.montant_paye || 0);
    const newDateExp = updates.date_expiration !== undefined ? updates.date_expiration : existing.date_expiration;
    const baseStatut = updates.statut !== undefined ? updates.statut : existing.statut;

    const newStatut = computeDemandePaiementStatus(baseStatut, newDateExp, newMontant, newMontantPaye);

    this.data.demandes_paiement[idx] = {
      ...existing,
      ...updates,
      montant: newMontant,
      montant_paye: newMontantPaye,
      date_expiration: newDateExp,
      statut: newStatut,
      updated_at: new Date().toISOString(),
    };

    this.save();
    return this.data.demandes_paiement[idx];
  }

  public cancelDemandePaiement(id: string, entrepriseId: string): DemandePaiement | undefined {
    if (!this.data.demandes_paiement) this.data.demandes_paiement = [];
    const idx = this.data.demandes_paiement.findIndex(d => d.id === id && d.entreprise_id === entrepriseId);
    if (idx === -1) return undefined;

    this.data.demandes_paiement[idx].statut = 'annulee';
    this.data.demandes_paiement[idx].updated_at = new Date().toISOString();
    this.save();
    return this.data.demandes_paiement[idx];
  }

  // --- Relances logs & Automatisations (STRICTEMENT ISOLÉES PAR TENANT) ---
  public getRelanceLogsByEntrepriseId(entrepriseId: string): RelanceLog[] {
    if (!this.data.relances_logs) this.data.relances_logs = [];
    return this.data.relances_logs
      .filter(l => l.entreprise_id === entrepriseId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createRelanceLog(log: RelanceLog): RelanceLog {
    if (!this.data.relances_logs) this.data.relances_logs = [];
    this.data.relances_logs.unshift(log);
    if (this.data.relances_logs.length > 500) {
      this.data.relances_logs = this.data.relances_logs.slice(0, 500);
    }
    this.save();
    return log;
  }

  public getAutoRelanceSettings(entrepriseId: string): { active: boolean; milestones: RelanceMilestone[] } {
    const ent = this.getEntrepriseById(entrepriseId);
    return {
      active: ent?.relance_auto_active !== false,
      milestones: (ent?.relance_auto_milestones as RelanceMilestone[]) || DEFAULT_RELANCE_MILESTONES,
    };
  }

  public updateAutoRelanceSettings(
    entrepriseId: string,
    settings: { active?: boolean; milestones?: RelanceMilestone[] }
  ): { active: boolean; milestones: RelanceMilestone[] } {
    const ent = this.getEntrepriseById(entrepriseId);
    if (!ent) throw new Error('Entreprise introuvable');

    const updates: Partial<Entreprise> = {};
    if (settings.active !== undefined) updates.relance_auto_active = settings.active;
    if (settings.milestones !== undefined) updates.relance_auto_milestones = settings.milestones;

    this.updateEntreprise(entrepriseId, updates);
    return this.getAutoRelanceSettings(entrepriseId);
  }

  /**
   * Enregistre une relance manuelle effectuée par l'entreprise
   */
  public recordManualRelance(
    entrepriseId: string,
    payload: { creanceId: string; message: string; canal?: 'whatsapp' | 'sms' }
  ): RelanceLog {
    const creance = this.getCreanceById(payload.creanceId, entrepriseId);
    if (!creance) throw new Error('Créance introuvable ou non autorisée');

    const client = this.getClientById(creance.client_id, entrepriseId);
    const rawPhone = client?.telephone || creance.client_telephone || '';
    const norm = normalizeWhatsAppPhone(rawPhone);

    const now = new Date().toISOString();
    const log: RelanceLog = {
      id: 'rel-' + Math.random().toString(36).substring(2, 9),
      entreprise_id: entrepriseId,
      creance_id: creance.id,
      client_id: creance.client_id,
      client_nom: client ? client.nom : (creance.client_nom || 'Client'),
      client_telephone: rawPhone,
      telephone_normalise: norm.normalized,
      type: 'manuel',
      milestone: 'manuel',
      montant_solde: creance.solde,
      montant_total: creance.montant_total,
      statut: norm.isValid ? 'envoye' : 'echec',
      motif_echec: norm.isValid ? undefined : (norm.error || 'Numéro WhatsApp manquant ou invalide'),
      message: payload.message,
      canal: payload.canal || 'whatsapp',
      created_at: now,
    };

    this.createRelanceLog(log);
    this.logActivity(
      entrepriseId,
      'Relance WhatsApp Manuelle',
      `Relance manuelle enregistrée pour ${log.client_nom} (Solde: ${creance.solde.toLocaleString('fr-FR')} F)`
    );

    return log;
  }

  /**
   * Moteur d'automatisation des relances : Évalue les échéances J-7, J-3, J0, J+3, J+7, J+14, J+30
   */
  public processAutoRelances(
    entrepriseId: string,
    options?: { simulatedDate?: string; forceMilestone?: RelanceMilestone; forceCreanceId?: string }
  ): {
    active: boolean;
    processedCount: number;
    sentCount: number;
    failedCount: number;
    skippedCount: number;
    logs: RelanceLog[];
  } {
    const entreprise = this.getEntrepriseById(entrepriseId);
    if (!entreprise) throw new Error('Entreprise introuvable');

    const settings = this.getAutoRelanceSettings(entrepriseId);
    if (!settings.active) {
      return {
        active: false,
        processedCount: 0,
        sentCount: 0,
        failedCount: 0,
        skippedCount: 0,
        logs: [],
      };
    }

    const refDate = options?.simulatedDate ? new Date(options.simulatedDate) : new Date();
    const creances = this.getCreancesByEntrepriseId(entrepriseId);
    const createdLogs: RelanceLog[] = [];
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const creance of creances) {
      if (options?.forceCreanceId && creance.id !== options.forceCreanceId) {
        continue;
      }

      // Règle 1 : Vérifier le solde avant chaque relance
      // Règle 2 : Paiement total (solde = 0) -> arrêter les relances futures
      if (creance.solde <= 0 || creance.statut === 'payee') {
        skippedCount++;
        continue;
      }

      // Calcul de l'échéance / milestone
      const { milestone } = options?.forceMilestone
        ? { milestone: options.forceMilestone }
        : calculateMilestone(creance.date_echeance, refDate);

      // Si pas de milestone correspondant ou milestone désactivé
      if (!milestone || !settings.milestones.includes(milestone)) {
        skippedCount++;
        continue;
      }

      // Vérifier si cette relance auto pour cette échéance spécifique a déjà été traitée
      const alreadyProcessed = (this.data.relances_logs || []).some(
        l => l.creance_id === creance.id && l.milestone === milestone && l.type === 'auto'
      );
      if (alreadyProcessed && !options?.forceMilestone) {
        skippedCount++;
        continue;
      }

      // Récupérer les infos client
      const client = this.getClientById(creance.client_id, entrepriseId);
      const rawPhone = client?.telephone || creance.client_telephone || '';
      const norm = normalizeWhatsAppPhone(rawPhone);

      // Règle 3 : Message personnalisé sur le solde restant (y compris en cas de paiement partiel)
      const clientName = client ? client.nom : (creance.client_nom || 'Client');
      const message = generateRelanceMessage(
        milestone,
        clientName,
        entreprise.nom,
        creance.solde,
        creance.motif,
        creance.date_echeance
      );

      const now = new Date().toISOString();
      const isSuccess = norm.isValid;

      const log: RelanceLog = {
        id: 'rel-' + Math.random().toString(36).substring(2, 9),
        entreprise_id: entrepriseId,
        creance_id: creance.id,
        client_id: creance.client_id,
        client_nom: clientName,
        client_telephone: rawPhone,
        telephone_normalise: norm.normalized,
        type: 'auto',
        milestone,
        montant_solde: creance.solde,
        montant_total: creance.montant_total,
        statut: isSuccess ? 'envoye' : 'echec',
        motif_echec: isSuccess ? undefined : (norm.error || 'Numéro WhatsApp absent ou invalide'),
        message,
        canal: 'whatsapp',
        created_at: now,
      };

      this.createRelanceLog(log);
      createdLogs.push(log);

      if (isSuccess) {
        sentCount++;
        this.logActivity(
          entrepriseId,
          'Relance Auto WhatsApp',
          `Relance automatique (${milestone}) générée pour ${clientName} - Solde: ${creance.solde.toLocaleString('fr-FR')} F`
        );
      } else {
        failedCount++;
        this.logActivity(
          entrepriseId,
          'Échec Relance Auto',
          `Échec relance (${milestone}) pour ${clientName} : Numéro WhatsApp manquant ou invalide`
        );
      }
    }

    return {
      active: true,
      processedCount: createdLogs.length,
      sentCount,
      failedCount,
      skippedCount,
      logs: createdLogs,
    };
  }

  // --- Activity logs ---
  public logActivity(entrepriseId: string | null, action: string, details: string) {
    const log: ActivityLog = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      entreprise_id: entrepriseId,
      action,
      details,
      created_at: new Date().toISOString(),
    };
    this.data.activity_logs.unshift(log);
    if (this.data.activity_logs.length > 200) {
      this.data.activity_logs = this.data.activity_logs.slice(0, 200);
    }
    this.save();
  }

  public getActivityLogs(entrepriseId?: string | null): ActivityLog[] {
    if (entrepriseId) {
      return this.data.activity_logs.filter(a => a.entreprise_id === entrepriseId);
    }
    return this.data.activity_logs;
  }
}

export const db = new Database();
