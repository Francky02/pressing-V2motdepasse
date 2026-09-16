import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  CreditCard,
  Building2,
  UserCheck,
  Send,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface ClientItem {
  id: string;
  entreprise_id: string;
  type: 'particulier' | 'entreprise';
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  notes: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
  financialSummary?: {
    creancesCount: number;
    totalDue: number;
    totalPaid: number;
    balance: number;
  };
}

interface CreanceItem {
  id: string;
  motif: string;
  description: string;
  montant_total: number;
  montant_paye: number;
  solde: number;
  date_creation: string;
  date_echeance: string;
  statut: 'en_attente' | 'partiellement_payee' | 'payee' | 'en_retard';
  notes: string;
}

interface PaiementItem {
  id: string;
  montant: number;
  date_paiement: string;
  moyen_paiement: string;
  reference: string;
  notes: string;
}

interface ClientDetailResponse {
  client: ClientItem;
  financialSummary: {
    creancesCount: number;
    totalDue: number;
    totalPaid: number;
    balance: number;
  };
  creances: CreanceItem[];
  paiements: PaiementItem[];
}

export const ClientsPage: React.FC = () => {
  const { company } = useAuth();
  const primaryColor = company?.couleur_principale || '#10b981';

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'with_balance'>('active');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickCreanceModalOpen, setIsQuickCreanceModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Client state
  const [formData, setFormData] = useState({
    type: 'particulier' as 'particulier' | 'entreprise',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    notes: '',
  });

  // Quick Créance Form state
  const [quickCreanceData, setQuickCreanceData] = useState({
    motif: 'Prestation de service',
    description: '',
    montant_total: '',
    date_echeance: '',
    notes: '',
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiRequest<{ clients: ClientItem[]; total: number }>(
        `/api/company/clients?includeInactive=true`
      );
      setClients(res.clients);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openClientDetail = async (client: ClientItem) => {
    try {
      setDetailLoading(true);
      setIsDetailModalOpen(true);
      const res = await apiRequest<ClientDetailResponse>(`/api/company/clients/${client.id}`);
      setSelectedClientDetail(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Impossible de charger la fiche client');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      type: 'particulier',
      nom: '',
      telephone: '',
      email: '',
      adresse: '',
      notes: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (client: ClientItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClient(client);
    setFormData({
      type: client.type,
      nom: client.nom,
      telephone: client.telephone,
      email: client.email || '',
      adresse: client.adresse || '',
      notes: client.notes || '',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim() || !formData.telephone.trim()) {
      setErrorMsg('Veuillez renseigner le nom et le numéro de téléphone');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg(null);

      if (editingClient) {
        await apiRequest(`/api/company/clients/${editingClient.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setSuccessMsg(`Client "${formData.nom}" mis à jour avec succès`);
      } else {
        await apiRequest(`/api/company/clients`, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setSuccessMsg(`Client "${formData.nom}" créé avec succès`);
      }

      setIsCreateModalOpen(false);
      await fetchClients();

      // Si la fiche détaillée est ouverte, la rafraîchir
      if (selectedClientDetail && editingClient && selectedClientDetail.client.id === editingClient.id) {
        openClientDetail({ ...editingClient, ...formData });
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleToggleStatus = async (client: ClientItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = !client.actif;
    try {
      setActionLoading(true);
      await apiRequest(`/api/company/clients/${client.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ actif: newStatus }),
      });
      setSuccessMsg(`Client ${newStatus ? 'réactivé' : 'archivé'} avec succès`);
      await fetchClients();
      if (selectedClientDetail && selectedClientDetail.client.id === client.id) {
        setSelectedClientDetail({
          ...selectedClientDetail,
          client: { ...selectedClientDetail.client, actif: newStatus },
        });
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de la modification du statut');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleOpenQuickCreance = (client: ClientItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClient(client);
    const in7Days = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    setQuickCreanceData({
      motif: 'Prestation de service',
      description: '',
      montant_total: '',
      date_echeance: in7Days,
      notes: '',
    });
    setIsQuickCreanceModalOpen(true);
  };

  const handleCreateQuickCreance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const amount = Number(quickCreanceData.montant_total);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Veuillez saisir un montant supérieur à 0 FCFA');
      return;
    }
    if (!quickCreanceData.date_echeance) {
      setErrorMsg('Veuillez choisir une date d\'échéance');
      return;
    }

    try {
      setActionLoading(true);
      await apiRequest(`/api/company/creances`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: editingClient.id,
          motif: quickCreanceData.motif,
          description: quickCreanceData.description,
          montant_total: amount,
          date_echeance: quickCreanceData.date_echeance,
          notes: quickCreanceData.notes,
        }),
      });

      setSuccessMsg(`Créance de ${amount.toLocaleString('fr-FR')} FCFA créée pour ${editingClient.nom}`);
      setIsQuickCreanceModalOpen(false);
      await fetchClients();
      if (selectedClientDetail && selectedClientDetail.client.id === editingClient.id) {
        openClientDetail(editingClient);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de la création de la créance');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Filtrage des clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch =
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.telephone.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.adresse.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === 'active') return c.actif;
      if (statusFilter === 'with_balance') return c.actif && (c.financialSummary?.balance || 0) > 0;
      return true;
    });
  }, [clients, search, statusFilter]);

  // Statistiques globales de la page
  const globalStats = useMemo(() => {
    let totalBalance = 0;
    let totalCollected = 0;
    let debtorsCount = 0;

    for (const c of clients) {
      if (c.actif) {
        const bal = c.financialSummary?.balance || 0;
        const paid = c.financialSummary?.totalPaid || 0;
        totalBalance += bal;
        totalCollected += paid;
        if (bal > 0) debtorsCount++;
      }
    }

    return {
      activeClients: clients.filter(c => c.actif).length,
      debtorsCount,
      totalBalance,
      totalCollected,
    };
  }, [clients]);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Alertes messages */}
      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, rgba(15, 23, 42, 0.65) 100%)`,
          border: `1px solid ${primaryColor}35`,
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div className="badge-pill" style={{ marginBottom: '0.4rem' }}>
            <Users size={14} color={primaryColor} />
            <span>Répertoire Clients • {company?.nom}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', fontWeight: 800, color: 'white', margin: 0 }}>
            Gestion des Clients & Débiteurs
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
            Consultez les coordonnées de vos clients, ce qu'ils vous doivent et préparez les demandes de règlement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchClients}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            <Plus size={16} />
            <span>Ajouter un client</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Clients Actifs</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${primaryColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={16} color={primaryColor} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{globalStats.activeClients}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {globalStats.debtorsCount} avec des créances à régler
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>Total Restant Dû</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={16} color="#f87171" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171' }}>
            {globalStats.totalBalance.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem' }}>FCFA</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Somme des soldes clients impayés
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>Total Déjà Encaissé</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>
            {globalStats.totalCollected.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem' }}>FCFA</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Règlements cumulés de ces clients
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client (nom, téléphone, adresse, email)..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '0.88rem',
              width: '100%',
              outline: 'none',
            }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: statusFilter === 'active' ? `1px solid ${primaryColor}` : '1px solid var(--border-subtle)',
              background: statusFilter === 'active' ? `${primaryColor}22` : 'transparent',
              color: statusFilter === 'active' ? 'white' : 'var(--text-secondary)',
            }}
          >
            Actifs ({clients.filter(c => c.actif).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('with_balance')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: statusFilter === 'with_balance' ? '1px solid #f87171' : '1px solid var(--border-subtle)',
              background: statusFilter === 'with_balance' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: statusFilter === 'with_balance' ? '#f87171' : 'var(--text-secondary)',
            }}
          >
            Avec dette ({clients.filter(c => c.actif && (c.financialSummary?.balance || 0) > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: statusFilter === 'all' ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
              background: statusFilter === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: statusFilter === 'all' ? 'white' : 'var(--text-secondary)',
            }}
          >
            Tous ({clients.length})
          </button>
        </div>
      </div>

      {/* Clients List / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={28} color={primaryColor} style={{ margin: '0 auto 1rem auto' }} />
          <div>Chargement de vos clients en cours...</div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: `${primaryColor}15`,
              color: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <Users size={28} />
          </div>
          <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
            {search ? 'Aucun client ne correspond à votre recherche' : 'Aucun client enregistré pour l\'instant'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
            {search
              ? 'Essayez de modifier votre mot-clé ou réinitialiser les filtres.'
              : 'Ajoutez votre premier client pour pouvoir créer des créances et suivre ses paiements.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary"
            style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            <Plus size={16} />
            <span>Ajouter un client</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {filteredClients.map(client => {
            const summary = client.financialSummary || {
              creancesCount: 0,
              totalDue: 0,
              totalPaid: 0,
              balance: 0,
            };
            const hasDebt = summary.balance > 0;

            return (
              <div
                key={client.id}
                onClick={() => openClientDetail(client)}
                style={{
                  background: 'var(--bg-surface)',
                  border: hasDebt ? '1px solid rgba(239, 68, 68, 0.28)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  opacity: client.actif ? 1 : 0.65,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = primaryColor;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = hasDebt ? 'rgba(239, 68, 68, 0.28)' : 'var(--border-subtle)';
                }}
              >
                {/* Top card row: Avatar & Identity & Badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: client.type === 'entreprise' ? '#6366f125' : `${primaryColor}22`,
                        border: client.type === 'entreprise' ? '1px solid #6366f140' : `1px solid ${primaryColor}40`,
                        color: client.type === 'entreprise' ? '#818cf8' : primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        flexShrink: 0,
                      }}
                    >
                      {client.type === 'entreprise' ? <Building2 size={20} /> : client.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem', lineHeight: 1.2 }}>
                        {client.nom}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: client.type === 'entreprise' ? '#6366f115' : 'rgba(255,255,255,0.06)', color: client.type === 'entreprise' ? '#a5b4fc' : 'var(--text-muted)' }}>
                          {client.type === 'entreprise' ? 'Entreprise' : 'Particulier'}
                        </span>
                        {!client.actif && (
                          <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                            Archivé
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Solde badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Solde restant</div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: hasDebt ? '#f87171' : '#34d399' }}>
                      {summary.balance.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>

                {/* Contact row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={13} color={primaryColor} />
                    <span style={{ fontWeight: 600, color: 'white' }}>{client.telephone}</span>
                  </div>
                  {client.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={13} color="var(--text-muted)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</span>
                    </div>
                  )}
                  {client.adresse && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.adresse}</span>
                    </div>
                  )}
                </div>

                {/* Financial bar summary */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Créances : </span>
                    <strong style={{ color: 'white' }}>{summary.creancesCount}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Facturé : </span>
                    <strong style={{ color: 'white' }}>{summary.totalDue.toLocaleString('fr-FR')} F</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Payé : </span>
                    <strong style={{ color: '#34d399' }}>{summary.totalPaid.toLocaleString('fr-FR')} F</strong>
                  </div>
                </div>

                {/* Actions bottom row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={(e) => handleOpenQuickCreance(client, e)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={13} />
                    <span>Créance</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(client, e)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => openClientDetail(client)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem', backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <span>Fiche</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1 : CRÉATION / MODIFICATION CLIENT */}
      {/* ==================================================== */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 13, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${primaryColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color={primaryColor} />
                </div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  {editingClient ? 'Modifier le client' : 'Nouveau client'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Type de client */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Type de client
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'particulier' })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: formData.type === 'particulier' ? `1px solid ${primaryColor}` : '1px solid var(--border-subtle)',
                      background: formData.type === 'particulier' ? `${primaryColor}20` : 'rgba(255,255,255,0.03)',
                      color: formData.type === 'particulier' ? 'white' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    Particulier
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'entreprise' })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: formData.type === 'entreprise' ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                      background: formData.type === 'entreprise' ? '#6366f125' : 'rgba(255,255,255,0.03)',
                      color: formData.type === 'entreprise' ? 'white' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    Entreprise / Société
                  </button>
                </div>
              </div>

              {/* Nom / Raison sociale */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Nom complet / Raison sociale *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: M. Kouamé Patrice ou Hôtel Ivoire Palace"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Téléphone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Numéro de téléphone (WhatsApp / SMS) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telephone}
                  onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Ex: +225 07 88 99 12 ou 07889912"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Ce numéro servira pour envoyer les relances automatiques et les liens de paiement sécurisés.
                </div>
              </div>

              {/* Email & Adresse */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@domaine.com"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Adresse / Ville
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="Cocody Riviera, Abidjan"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Notes internes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations utiles sur ce client..."
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                  {actionLoading ? 'Enregistrement...' : editingClient ? 'Enregistrer les modifications' : 'Créer le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2 : FICHE CLIENT COMPLÈTE & HISTORIQUE */}
      {/* ==================================================== */}
      {isDetailModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 13, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: `${primaryColor}22`,
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  {selectedClientDetail?.client.type === 'entreprise' ? <Building2 size={22} /> : selectedClientDetail?.client.nom.charAt(0)}
                </div>
                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    {selectedClientDetail?.client.nom}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Client depuis le {selectedClientDetail?.client.created_at ? new Date(selectedClientDetail.client.created_at).toLocaleDateString('fr-FR') : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedClientDetail && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedClientDetail.client)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', color: selectedClientDetail.client.actif ? '#fb7185' : '#34d399' }}
                    >
                      {selectedClientDetail.client.actif ? 'Archiver' : 'Réactiver'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(selectedClientDetail.client)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem' }}
                    >
                      Modifier
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '0.5rem' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body Scrollable */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {detailLoading || !selectedClientDetail ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Sparkles className="animate-spin" size={28} color={primaryColor} style={{ margin: '0 auto 1rem auto' }} />
                  <div>Chargement des détails financiers...</div>
                </div>
              ) : (
                <>
                  {/* Coordonnées */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={15} color={primaryColor} />
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Téléphone</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{selectedClientDetail.client.telephone}</div>
                      </div>
                    </div>
                    {selectedClientDetail.client.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={15} color={primaryColor} />
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Email</div>
                          <div style={{ fontSize: '0.85rem', color: 'white' }}>{selectedClientDetail.client.email}</div>
                        </div>
                      </div>
                    )}
                    {selectedClientDetail.client.adresse && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={15} color={primaryColor} />
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Adresse</div>
                          <div style={{ fontSize: '0.85rem', color: 'white' }}>{selectedClientDetail.client.adresse}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Situation Financière */}
                  <div>
                    <h4 style={{ color: 'white', margin: '0 0 0.75rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                      Situation Financière du Client
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Facturé / Dû</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginTop: '0.2rem' }}>
                          {selectedClientDetail.financialSummary.totalDue.toLocaleString('fr-FR')} F
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-main)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Total Encaissé</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                          {selectedClientDetail.financialSummary.totalPaid.toLocaleString('fr-FR')} F
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-main)', border: selectedClientDetail.financialSummary.balance > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: selectedClientDetail.financialSummary.balance > 0 ? '#f87171' : 'var(--text-muted)' }}>
                          Solde Restant à Payer
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: selectedClientDetail.financialSummary.balance > 0 ? '#f87171' : 'white', marginTop: '0.2rem' }}>
                          {selectedClientDetail.financialSummary.balance.toLocaleString('fr-FR')} F
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickCreance(selectedClientDetail.client)}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={14} />
                      <span>Ajouter une créance pour ce client</span>
                    </button>

                    <a
                      href={`https://wa.me/${selectedClientDetail.client.telephone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Bonjour ${selectedClientDetail.client.nom}, vous avez un solde de ${selectedClientDetail.financialSummary.balance.toLocaleString('fr-FR')} FCFA sur votre compte ${company?.nom}. Merci de procéder au règlement.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                    >
                      <Send size={13} color="#22c55e" />
                      <span>Contacter sur WhatsApp</span>
                    </a>
                  </div>

                  {/* Créances du client */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={16} color={primaryColor} />
                        <span>Créances enregistrées ({selectedClientDetail.creances.length})</span>
                      </h4>
                    </div>

                    {selectedClientDetail.creances.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                        Aucune créance enregistrée pour ce client.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedClientDetail.creances.map(creance => {
                          const isPaid = creance.statut === 'payee';
                          const isOverdue = creance.statut === 'en_retard';

                          return (
                            <div
                              key={creance.id}
                              style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.85rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: '180px' }}>
                                <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>
                                  {creance.motif}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  Échéance : {creance.date_echeance} {isOverdue && <span style={{ color: '#f87171' }}>(En retard)</span>}
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>
                                  {creance.montant_total.toLocaleString('fr-FR')} FCFA
                                </div>
                                <div style={{ fontSize: '0.72rem', color: isPaid ? '#34d399' : '#f87171' }}>
                                  Solde : {creance.solde.toLocaleString('fr-FR')} FCFA
                                </div>
                              </div>

                              <div>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    background: isPaid ? 'rgba(16, 185, 129, 0.15)' : isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                    color: isPaid ? '#34d399' : isOverdue ? '#f87171' : '#60a5fa',
                                  }}
                                >
                                  {isPaid ? 'PAYÉE' : isOverdue ? 'EN RETARD' : creance.statut === 'partiellement_payee' ? 'PARTIELLE' : 'EN ATTENTE'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Historique des Règlements */}
                  <div>
                    <h4 style={{ color: 'white', margin: '0 0 0.75rem 0', fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CreditCard size={16} color="#34d399" />
                      <span>Historique des règlements ({selectedClientDetail.paiements.length})</span>
                    </h4>

                    {selectedClientDetail.paiements.length === 0 ? (
                      <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                        Aucun paiement enregistré pour l'instant.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {selectedClientDetail.paiements.map(p => (
                          <div
                            key={p.id}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.65rem 0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 600, color: 'white' }}>{p.reference}</span>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({p.moyen_paiement})</span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.date_paiement}</div>
                            </div>
                            <div style={{ fontWeight: 800, color: '#34d399' }}>
                              +{p.montant.toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section Préparation Relances & Demandes de paiement */}
                  <div
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.84rem' }}>
                      <Clock size={16} />
                      <span>Préparation des Relances & Demandes de Paiement</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Le système Relancio est configuré pour générer des liens de paiement personnalisés avec l'identité visuelle de {company?.nom}. Les relances WhatsApp automatiques seront bientôt déclenchées selon les dates d'échéance.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3 : CRÉATION RAPIDE DE CRÉANCE POUR UN CLIENT */}
      {/* ==================================================== */}
      {isQuickCreanceModalOpen && editingClient && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 13, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsQuickCreanceModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${primaryColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color={primaryColor} />
                </div>
                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    Nouvelle créance
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Pour : <strong style={{ color: 'white' }}>{editingClient.nom}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCreanceModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickCreance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Motif de la créance *
                </label>
                <select
                  value={quickCreanceData.motif}
                  onChange={e => setQuickCreanceData({ ...quickCreanceData, motif: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  <option value="Prestation de service">Prestation de service</option>
                  <option value="Produit / Marchandise">Produit / Marchandise</option>
                  <option value="Réparation / SAV">Réparation / SAV</option>
                  <option value="Scolarité / Formation">Scolarité / Formation</option>
                  <option value="Nettoyage / Pressing">Nettoyage / Pressing</option>
                  <option value="Commande / Facture">Commande / Facture</option>
                  <option value="Honoraires">Honoraires</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Montant total (FCFA) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quickCreanceData.montant_total}
                  onChange={e => setQuickCreanceData({ ...quickCreanceData, montant_total: e.target.value })}
                  placeholder="Ex: 50000"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Date d'échéance du règlement *
                </label>
                <input
                  type="date"
                  required
                  value={quickCreanceData.date_echeance}
                  onChange={e => setQuickCreanceData({ ...quickCreanceData, date_echeance: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Description des prestations / articles
                </label>
                <textarea
                  rows={2}
                  value={quickCreanceData.description}
                  onChange={e => setQuickCreanceData({ ...quickCreanceData, description: e.target.value })}
                  placeholder="Détail des prestations ou articles facturés..."
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsQuickCreanceModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                  {actionLoading ? 'Enregistrement...' : 'Valider la créance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
