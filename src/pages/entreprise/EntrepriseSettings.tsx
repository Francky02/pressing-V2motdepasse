import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Upload,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  Palette,
  RefreshCw,
} from 'lucide-react';

export const EntrepriseSettings: React.FC = () => {
  const { company, updateCompanyProfile, deleteCompanyLogo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nom: company?.nom || '',
    responsable: company?.responsable || '',
    email: company?.email || '',
    telephone: company?.telephone || '',
    secteur: company?.secteur || 'Pressing',
    adresse: company?.adresse || '',
    couleur_principale: company?.couleur_principale || '#10b981',
    couleur_secondaire: company?.couleur_secondaire || '#0ea5e9',
    logo: company?.logo || null,
  });

  type SaveStatus = 'idle' | 'saving' | 'success' | 'error';
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const presetColors = [
    '#10b981', // Emerald
    '#0ea5e9', // Sky Blue
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#14b8a6', // Teal
    '#e11d48', // Crimson
  ];

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, logo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await deleteCompanyLogo();
      setFormData(prev => ({ ...prev, logo: null }));
      setSuccessMessage('Logo supprimé avec succès.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage('Erreur lors de la suppression du logo.');
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saveStatus === 'saving') return;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    setSaveStatus('saving');
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateCompanyProfile(formData);
      setSaveStatus('success');
      setSuccessMessage('Modifications enregistrées avec succès.');
      resetTimerRef.current = setTimeout(() => {
        setSaveStatus('idle');
        setSuccessMessage(null);
      }, 3000);
    } catch (err: unknown) {
      setSaveStatus('error');
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement';
      setErrorMessage(msg);
      resetTimerRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 3500);
    }
  };

  const getButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <RefreshCw size={14} className="animate-spin" />
            <span>Enregistrement...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle2 size={14} />
            <span>Modifications enregistrées avec succès.</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle size={14} />
            <span>Erreur lors de l'enregistrement</span>
          </>
        );
      default:
        return (
          <>
            <Save size={14} />
            <span>Enregistrer</span>
          </>
        );
    }
  };

  const getButtonStyle = () => {
    if (saveStatus === 'success') {
      return {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        color: '#ffffff',
        boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
        transition: 'all 0.25s ease',
      };
    }
    if (saveStatus === 'error') {
      return {
        backgroundColor: '#f43f5e',
        borderColor: '#f43f5e',
        color: '#ffffff',
        boxShadow: '0 0 12px rgba(244, 63, 94, 0.4)',
        transition: 'all 0.25s ease',
      };
    }
    return {
      backgroundColor: formData.couleur_principale,
      borderColor: formData.couleur_principale,
      color: '#ffffff',
      transition: 'all 0.25s ease',
    };
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top Header avec bouton Enregistrer accessible immédiatement */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${formData.couleur_principale}25`, color: formData.couleur_principale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={16} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
              Paramètres de l'Entreprise
            </h1>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Identité visuelle, logo, coordonnées affichés sur vos reçus et liens de paiement
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="btn btn-primary btn-sm"
          style={{
            ...getButtonStyle(),
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
          }}
        >
          {getButtonContent()}
        </button>
      </div>

      {successMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout: Left Form / Right Sticky Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        {/* Left Form (Compact Groupings) */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Box 1: Logo & Couleurs */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Palette size={15} color={formData.couleur_principale} />
              <span>Logo & Couleurs de marque</span>
            </div>

            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  backgroundColor: formData.couleur_principale,
                  border: '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                }}
              >
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={24} color="white" />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Upload size={12} />
                    <span>{formData.logo ? 'Remplacer' : 'Importer un logo'}</span>
                  </button>

                  {formData.logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#fb7185', fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PNG, JPG, SVG</span>
              </div>
            </div>

            {/* Colors picker */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Couleur principale
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {presetColors.slice(0, 4).map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFormData({ ...formData, couleur_principale: col })}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: col,
                        border: formData.couleur_principale === col ? '2px solid white' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.couleur_principale}
                    onChange={e => setFormData({ ...formData, couleur_principale: e.target.value })}
                    style={{ width: '26px', height: '26px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {formData.couleur_principale}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Couleur secondaire
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="color"
                    value={formData.couleur_secondaire}
                    onChange={e => setFormData({ ...formData, couleur_secondaire: e.target.value })}
                    style={{ width: '26px', height: '26px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {formData.couleur_secondaire}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Coordonnées de l'entreprise (2-column grid on desktop) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'white' }}>
              Coordonnées de l'entreprise
            </div>

            {/* Nom & Secteur */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Nom commercial *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Secteur d'activité *
                </label>
                <select
                  value={formData.secteur}
                  onChange={e => setFormData({ ...formData, secteur: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#111827',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Pressing">Pressing & Blanchisserie</option>
                  <option value="École">École & Éducation</option>
                  <option value="Garage">Garage & Réparation Auto</option>
                  <option value="Salon">Salon de coiffure & Beauté</option>
                  <option value="Commerce">Commerce & Vente de détail</option>
                  <option value="Artisan">Artisan & BTP</option>
                  <option value="Services">Entreprise de services & Conseil</option>
                  <option value="Autre">Autre profession</option>
                </select>
              </div>
            </div>

            {/* Responsable & Téléphone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Nom du responsable
                </label>
                <input
                  type="text"
                  value={formData.responsable}
                  onChange={e => setFormData({ ...formData, responsable: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Téléphone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Email & Adresse */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Email de facturation
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Adresse physique
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="btn btn-primary btn-sm"
                style={{
                  ...getButtonStyle(),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
                }}
              >
                {getButtonContent()}
              </button>
            </div>
          </div>
        </form>

        {/* Right Sticky Live Preview */}
        <div
          style={{
            position: 'sticky',
            top: '1rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Aperçu en temps réel
          </div>

          <div
            style={{
              background: 'rgba(11, 15, 25, 0.95)',
              border: `1px solid ${formData.couleur_principale}44`,
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: formData.couleur_principale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={18} color="white" />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>
                  {formData.nom || 'Nom de votre entreprise'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {formData.secteur}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {formData.telephone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={12} color={formData.couleur_principale} />
                  <span>{formData.telephone}</span>
                </div>
              )}
              {formData.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={12} color={formData.couleur_principale} />
                  <span>{formData.email}</span>
                </div>
              )}
              {formData.adresse && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={12} color={formData.couleur_principale} />
                  <span>{formData.adresse}</span>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: '0.25rem',
                padding: '0.5rem',
                borderRadius: '6px',
                backgroundColor: formData.couleur_principale,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.78rem',
                textAlign: 'center',
              }}
            >
              Bouton personnalisé client
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
