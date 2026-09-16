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

export interface ActivityLog {
  id: string;
  entreprise_id: string | null;
  action: string;
  details: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  entreprises: Entreprise[];
  clients: Client[];
  creances: Creance[];
  paiements: Paiement[];
  activity_logs: ActivityLog[];
}
