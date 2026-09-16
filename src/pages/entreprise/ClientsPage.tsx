import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  Users,
  Search,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  CreditCard,
  Building2,
  Send,
  Edit2,
  Archive,
  RotateCcw,
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
        setSuccessMsg(`Client "${formData.nom}" mis à jour`);
      } else {
        await apiRequest(`/api/company/clients`, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setSuccessMsg(`Client "${formData.nom}" créé`);
      }

      setIsCreateModalOpen(false);
      await fetchClients();

      if (selectedClientDetail && editingClient && selectedClientDetail.client.id === editingClient.id) {
        openClientDetail({ ...editingClient, ...formData });
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 3500);
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
      setSuccessMsg(`Client ${newStatus ? 'réactivé' : 'archivé'}`);
      await fetchClients();
      if (selectedClientDetail && selectedClientDetail.client.id === client.id) {
        setSelectedClientDetail({
          ...selectedClientDetail,
          client: { ...selectedClientDetail.client, actif: newStatus },
        });
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur modification statut');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 3500);
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
      setErrorMsg(err instanceof Error ? err.message : 'Erreur création créance');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

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
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Alertes messages */}
      {errorMsg && (
        <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <AlertTriangle size={15} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <CheckCircle2 size={15} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* Unified Compact Top Bar : Titre, Recherche, Filtres, Actions & KPIs */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Title & Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${primaryColor}20`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
                Clients
              </h1>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                {filteredClients.length}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Restant dû : <strong style={{ color: '#f87171' }}>{globalStats.totalBalance.toLocaleString('fr-FR')} F</strong> • Encaissé : <strong style={{ color: '#34d399' }}>{globalStats.totalCollected.toLocaleString('fr-FR')} F</strong>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.65rem',
            minWidth: '220px',
            flex: 1,
            maxWidth: '320px',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher nom, tél..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '0.82rem',
              width: '100%',
              outline: 'none',
            }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter pills & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '0.15rem' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: statusFilter === 'active' ? `${primaryColor}30` : 'transparent',
                color: statusFilter === 'active' ? 'white' : 'var(--text-secondary)',
              }}
            >
              Actifs ({globalStats.activeClients})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('with_balance')}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: statusFilter === 'with_balance' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                color: statusFilter === 'with_balance' ? '#f87171' : 'var(--text-secondary)',
              }}
            >
              Avec dette ({globalStats.debtorsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: statusFilter === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: statusFilter === 'all' ? 'white' : 'var(--text-secondary)',
              }}
            >
              Tous ({clients.length})
            </button>
          </div>

          <button
            type="button"
            onClick={fetchClients}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.55rem' }}
            title="Actualiser"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            <Plus size={14} />
            <span>Nouveau client</span>
          </button>
        </div>
      </div>

      {/* High-density Client Table on Desktop / Compact cards on Mobile */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={24} color={primaryColor} style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontSize: '0.85rem' }}>Chargement des clients...</div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <Users size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
            {search ? 'Aucun client ne correspond à la recherche' : 'Aucun client pour l\'instant'}
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '1rem', backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            <Plus size={14} />
            <span>Ajouter un premier client</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Desktop Table View */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>Client</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>Contact (WhatsApp)</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: 'center' }}>Créances</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: 'right' }}>Total Facturé</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: 'right' }}>Déjà Payé</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: 'right' }}>Solde Dû</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => {
                  const summary = client.financialSummary || {
                    creancesCount: 0,
                    totalDue: 0,
                    totalPaid: 0,
                    balance: 0,
                  };
                  const hasDebt = summary.balance > 0;
                  const waPhone = client.telephone ? client.telephone.replace(/[^0-9]/g, '') : '';

                  return (
                    <tr
                      key={client.id}
                      onClick={() => openClientDetail(client)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease',
                        opacity: client.actif ? 1 : 0.6,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Nom */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '7px',
                              backgroundColor: client.type === 'entreprise' ? '#6366f120' : `${primaryColor}20`,
                              color: client.type === 'entreprise' ? '#a5b4fc' : primaryColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              flexShrink: 0,
                            }}
                          >
                            {client.type === 'entreprise' ? <Building2 size={15} /> : client.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: 'white' }}>{client.nom}</span>
                            {!client.actif && (
                              <span style={{ marginLeft: '0.35rem', fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '3px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                                Archivé
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Téléphone */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{client.telephone}</span>
                          {waPhone && (
                            <a
                              href={`https://wa.me/${waPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              title="Ouvrir WhatsApp"
                              style={{ color: '#22c55e', display: 'flex', alignItems: 'center' }}
                            >
                              <Send size={12} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span style={{ fontSize: '0.68rem', padding: '0.12rem 0.4rem', borderRadius: '3px', background: client.type === 'entreprise' ? '#6366f115' : 'rgba(255,255,255,0.05)', color: client.type === 'entreprise' ? '#a5b4fc' : 'var(--text-muted)' }}>
                          {client.type === 'entreprise' ? 'Société' : 'Particulier'}
                        </span>
                      </td>

                      {/* Créances count */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: 700, color: 'white' }}>
                        {summary.creancesCount}
                      </td>

                      {/* Total facturé */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {summary.totalDue.toLocaleString('fr-FR')} F
                      </td>

                      {/* Total payé */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#34d399' }}>
                        {summary.totalPaid.toLocaleString('fr-FR')} F
                      </td>

                      {/* Solde restant dû */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: hasDebt ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: hasDebt ? '#f87171' : '#34d399',
                            border: hasDebt ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          {summary.balance.toLocaleString('fr-FR')} F
                        </span>
                      </td>

                      {/* Actions rapides */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }} onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleOpenQuickCreance(client, e)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                            title="Ajouter une créance"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(client, e)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                            title="Modifier"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openClientDetail(client)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', backgroundColor: primaryColor, borderColor: primaryColor }}
                          >
                            Fiche
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1 : FICHE CLIENT COMPACTE & DIRECTE */}
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
            backdropFilter: 'blur(10px)',
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
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header : Identité & Actions */}
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: `${primaryColor}22`,
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  {selectedClientDetail?.client.type === 'entreprise' ? <Building2 size={18} /> : selectedClientDetail?.client.nom.charAt(0)}
                </div>
                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    {selectedClientDetail?.client.nom}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedClientDetail?.client.telephone} {selectedClientDetail?.client.email ? `• ${selectedClientDetail.client.email}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {selectedClientDetail && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedClientDetail.client)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                      title={selectedClientDetail.client.actif ? 'Archiver' : 'Réactiver'}
                    >
                      {selectedClientDetail.client.actif ? <Archive size={12} /> : <RotateCcw size={12} />}
                      <span style={{ marginLeft: '0.25rem' }}>{selectedClientDetail.client.actif ? 'Archiver' : 'Réactiver'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(selectedClientDetail.client)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                    >
                      Modifier
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '0.4rem' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.15rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {detailLoading || !selectedClientDetail ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <Sparkles className="animate-spin" size={24} color={primaryColor} style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>Chargement des données...</div>
                </div>
              ) : (
                <>
                  {/* Niveau 1 : Situation Financière Directe (Visible immédiatement en haut) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                    <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.65rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Facturé / Dû</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', marginTop: '0.15rem' }}>
                        {selectedClientDetail.financialSummary.totalDue.toLocaleString('fr-FR')} F
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-main)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#34d399' }}>Total Encaissé</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
                        {selectedClientDetail.financialSummary.totalPaid.toLocaleString('fr-FR')} F
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-main)', border: selectedClientDetail.financialSummary.balance > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.65rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: selectedClientDetail.financialSummary.balance > 0 ? '#f87171' : 'var(--text-muted)' }}>
                        Solde Restant à Payer
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: selectedClientDetail.financialSummary.balance > 0 ? '#f87171' : 'white', marginTop: '0.15rem' }}>
                        {selectedClientDetail.financialSummary.balance.toLocaleString('fr-FR')} F
                      </div>
                    </div>
                  </div>

                  {/* Actions d'encaissement et contact */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickCreance(selectedClientDetail.client)}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', padding: '0.4rem 0.75rem' }}
                    >
                      <Plus size={13} />
                      <span>Ajouter une créance</span>
                    </button>

                    <a
                      href={`https://wa.me/${selectedClientDetail.client.telephone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Bonjour ${selectedClientDetail.client.nom}, vous avez un solde de ${selectedClientDetail.financialSummary.balance.toLocaleString('fr-FR')} FCFA sur votre compte ${company?.nom}. Merci de procéder au règlement.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', fontSize: '0.76rem', padding: '0.4rem 0.75rem', color: '#22c55e' }}
                    >
                      <Send size={13} />
                      <span>Contacter sur WhatsApp</span>
                    </a>
                  </div>

                  {/* Créances du client (Compact list) */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={15} color={primaryColor} />
                      <span>Créances ({selectedClientDetail.creances.length})</span>
                    </div>

                    {selectedClientDetail.creances.length === 0 ? (
                      <div style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                        Aucune créance enregistrée.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {selectedClientDetail.creances.map(cr => (
                          <div
                            key={cr.id}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.6rem 0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: 'white' }}>{cr.motif}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Échéance : {cr.date_echeance}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: 'white' }}>{cr.montant_total.toLocaleString('fr-FR')} F</div>
                              <div style={{ fontSize: '0.7rem', color: cr.solde > 0 ? '#f87171' : '#34d399' }}>
                                Solde : {cr.solde.toLocaleString('fr-FR')} F
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Règlements (Compact list) */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CreditCard size={15} color="#34d399" />
                      <span>Historique des paiements ({selectedClientDetail.paiements.length})</span>
                    </div>

                    {selectedClientDetail.paiements.length === 0 ? (
                      <div style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                        Aucun paiement enregistré pour ce client.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {selectedClientDetail.paiements.map(p => (
                          <div
                            key={p.id}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.5rem 0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.78rem',
                            }}
                          >
                            <div>
                              <strong style={{ color: 'white' }}>{p.reference}</strong> ({p.moyen_paiement}) • {p.date_paiement}
                            </div>
                            <div style={{ fontWeight: 800, color: '#34d399' }}>
                              +{p.montant.toLocaleString('fr-FR')} F
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2 : FORMULAIRE COMPACT AJOUT / MODIF CLIENT */}
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
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '480px',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'particulier' })}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-xs)',
                    border: formData.type === 'particulier' ? `1px solid ${primaryColor}` : '1px solid var(--border-subtle)',
                    background: formData.type === 'particulier' ? `${primaryColor}20` : 'transparent',
                    color: formData.type === 'particulier' ? 'white' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Particulier
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'entreprise' })}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-xs)',
                    border: formData.type === 'entreprise' ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                    background: formData.type === 'entreprise' ? '#6366f125' : 'transparent',
                    color: formData.type === 'entreprise' ? 'white' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Entreprise
                </button>
              </div>

              {/* Nom & Téléphone sur 2 colonnes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="M. Kouamé Patrice"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Téléphone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+225 07 88 99 12"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Email & Adresse sur 2 colonnes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patrice@email.com"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Adresse / Quartier
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="Cocody, Abidjan"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Notes internes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes sur ce client..."
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                  {actionLoading ? 'Enregistrement...' : editingClient ? 'Enregistrer' : 'Créer le client'}
                </button>
              </div>
            </form>
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
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '480px',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  Nouvelle créance
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Pour : <strong style={{ color: 'white' }}>{editingClient.nom}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCreanceModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickCreance} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Motif de la créance *
                </label>
                <select
                  value={quickCreanceData.motif}
                  onChange={e => setQuickCreanceData({ ...quickCreanceData, motif: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.84rem',
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
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
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Date d'échéance *
                  </label>
                  <input
                    type="date"
                    required
                    value={quickCreanceData.date_echeance}
                    onChange={e => setQuickCreanceData({ ...quickCreanceData, date_echeance: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Description des prestations
                </label>
                <input
                  type="text"
                  value={quickCreanceData.description}
                  onChange={e => setQuickCreanceData({ ...quickCreanceData, description: e.target.value })}
                  placeholder="Détails facturés..."
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsQuickCreanceModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
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
