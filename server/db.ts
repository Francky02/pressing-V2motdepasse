import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSchema, User, Entreprise, Creance, ActivityLog } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    entreprises: [],
    creances: [],
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
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Erreur lecture db.json, réinitialisation...', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    console.log('Seeding initial Relancio database...');
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

    const creances: Creance[] = [
      // Créances strictes Entreprise A
      {
        id: 'cre-rc-01',
        entreprise_id: 'ent-royal-clean',
        client_nom: 'M. Kouamé Patrice',
        client_telephone: '+225 05 11 22 33',
        montant: 45000,
        motif: 'Nettoyage 4 costumes 3 pièces + 6 chemises',
        statut: 'relance',
        echeance: '2026-09-20',
        created_at: now,
      },
      {
        id: 'cre-rc-02',
        entreprise_id: 'ent-royal-clean',
        client_nom: 'Hôtel Ivoire Palace',
        client_telephone: '+225 07 99 88 77',
        montant: 280000,
        motif: 'Lavage linge hôtelier de luxe lot #B4',
        statut: 'en_attente',
        echeance: '2026-09-25',
        created_at: now,
      },
      {
        id: 'cre-rc-03',
        entreprise_id: 'ent-royal-clean',
        client_nom: 'Mme Bamba Awa',
        client_telephone: '+225 01 44 55 66',
        montant: 35000,
        motif: 'Détachage robe de soirée en soie',
        statut: 'paye',
        echeance: '2026-09-12',
        created_at: now,
      },

      // Créances strictes Entreprise B
      {
        id: 'cre-ee-01',
        entreprise_id: 'ent-etoiles-ecole',
        client_nom: 'M. Sarr Amadou (Parent élève)',
        client_telephone: '+221 77 123 45 67',
        montant: 150000,
        motif: 'Frais de scolarité Trimestre 2 - Classe 3ème B',
        statut: 'relance',
        echeance: '2026-09-18',
        created_at: now,
      },
      {
        id: 'cre-ee-02',
        entreprise_id: 'ent-etoiles-ecole',
        client_nom: 'Mme Ndiaye Mariama',
        client_telephone: '+221 78 987 65 43',
        montant: 85000,
        motif: 'Transport scolaire & cantine Septembre',
        statut: 'en_attente',
        echeance: '2026-09-30',
        created_at: now,
      },
      {
        id: 'cre-ee-03',
        entreprise_id: 'ent-etoiles-ecole',
        client_nom: 'M. Kane Ousmane',
        client_telephone: '+221 70 555 44 33',
        montant: 150000,
        motif: 'Frais de scolarité Trimestre 1 - Classe Terminale S',
        statut: 'paye',
        echeance: '2026-09-05',
        created_at: now,
      },
    ];

    const activity_logs: ActivityLog[] = [
      {
        id: 'act-01',
        entreprise_id: 'ent-royal-clean',
        action: 'Relance envoyée',
        details: 'Relance WhatsApp automatique envoyée à M. Kouamé Patrice (45 000 FCFA)',
        created_at: now,
      },
      {
        id: 'act-02',
        entreprise_id: 'ent-etoiles-ecole',
        action: 'Paiement reçu',
        details: 'Encaissement validé 150 000 FCFA pour M. Kane Ousmane',
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
      creances,
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

  // User queries
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

  // Entreprise queries
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

  // Créances queries - strictly tenant scoped!
  public getCreancesByEntrepriseId(entrepriseId: string): Creance[] {
    return this.data.creances.filter(c => c.entreprise_id === entrepriseId);
  }

  public createCreance(creance: Creance): Creance {
    this.data.creances.push(creance);
    this.save();
    return creance;
  }

  // Activity logs
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
