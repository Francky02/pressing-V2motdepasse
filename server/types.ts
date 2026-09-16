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

export interface Creance {
  id: string;
  entreprise_id: string;
  client_nom: string;
  client_telephone: string;
  montant: number;
  motif: string;
  statut: 'en_attente' | 'relance' | 'paye';
  echeance: string;
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
  creances: Creance[];
  activity_logs: ActivityLog[];
}
