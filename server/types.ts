export type UserRole = 'SUPER_ADMIN' | 'ENTREPRISE_ADMIN' | 'EMPLOYE';

export interface User {
  id: string;
  entreprise_id: string | null;
  nom: string;
  email: string;
  telephone: string;
  password_hash: string;
  role: UserRole;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entreprise {
  id: string;
  nom: string;
  responsable: string;
  email: string;
  telephone: string;
  secteur: string;
  logo: string | null;
  couleur_principale: string;
  couleur_secondaire: string;
  adresse: string;
  actif: boolean;
  relance_auto_active?: boolean;
  relance_auto_milestones?: string[];
  created_at: string;
  updated_at: string;
}

export type ClientType = 'particulier' | 'entreprise';

export interface Client {
  id: string;
  entreprise_id: string;
  type: ClientType;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  notes: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export type CreanceStatut = 'en_attente' | 'partiellement_payee' | 'payee' | 'en_retard';

export interface Creance {
  id: string;
  entreprise_id: string;
  client_id: string;
  client_nom?: string;
  client_telephone?: string;
  motif: string;
  description: string;
  montant_total: number;
  montant_paye: number;
  solde: number;
  date_creation: string;
  date_echeance: string;
  statut: CreanceStatut;
  notes: string;
  // Legacy alias compatibility
  montant?: number;
  echeance?: string;
  created_at: string;
  updated_at: string;
}

export type MoyenPaiement = 'especes' | 'virement' | 'cheque' | 'wave' | 'om' | 'momo' | 'carte' | 'autre';

export interface Paiement {
  id: string;
  entreprise_id: string;
  creance_id: string;
  client_id: string;
  montant: number;
  date_paiement: string;
  moyen_paiement: MoyenPaiement;
  reference: string;
  notes: string;
  created_at: string;
}

export type DemandePaiementStatut = 'en_attente' | 'partiellement_payee' | 'payee' | 'expiree' | 'annulee';

export interface DemandePaiement {
  id: string;
  entreprise_id: string;
  creance_id: string;
  client_id: string;
  montant: number;
  montant_paye?: number;
  motif: string;
  token: string;
  date_creation: string;
  date_expiration: string;
  statut: DemandePaiementStatut;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type RelanceType = 'manuel' | 'auto';
export type RelanceMilestone = 'J-7' | 'J-3' | 'J0' | 'J+3' | 'J+7' | 'J+14' | 'J+30' | 'manuel';
export type RelanceStatus = 'envoye' | 'echec' | 'annule';

export interface RelanceLog {
  id: string;
  entreprise_id: string;
  creance_id: string;
  client_id: string;
  client_nom: string;
  client_telephone: string;
  telephone_normalise: string;
  type: RelanceType;
  milestone: RelanceMilestone;
  montant_solde: number;
  montant_total: number;
  statut: RelanceStatus;
  motif_echec?: string;
  message: string;
  canal: 'whatsapp' | 'sms';
  created_at: string;
}

export interface ActivityLog {
  id: string;
  entreprise_id: string | null;
  action: string;
  details: string;
  created_at: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  entreprises: Entreprise[];
  clients: Client[];
  creances: Creance[];
  paiements: Paiement[];
  demandes_paiement?: DemandePaiement[];
  relances_logs?: RelanceLog[];
  activity_logs: ActivityLog[];
  password_reset_tokens?: PasswordResetToken[];
}
