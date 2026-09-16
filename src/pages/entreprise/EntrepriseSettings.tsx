import React, { useState, useRef } from 'react';
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
  Lock,
  ShieldCheck,
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

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      setSaving(true);
      await updateCompanyProfile(formData);
      setSuccessMessage('Paramètres de l\'entreprise enregistrés avec succès !');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: 'white', margin: 0 }}>
          Profil & Personnalisation de l'Entreprise
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
          Personnalisez votre logo, vos couleurs et vos coordonnées. Ces informations s'afficheront directement sur les demandes et reçus de paiement de vos clients.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Left Editor / Right Live Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Logo Manager Box */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
              Logo de l'entreprise
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  backgroundColor: formData.couleur_principale,
                  border: '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                }}
              >
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={36} color="white" />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                  >
                    <Upload size={14} />
                    <span>{formData.logo ? 'Remplacer le logo' : 'Importer un logo'}</span>
                  </button>

                  {formData.logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#fb7185', borderColor: 'rgba(244,63,94,0.3)' }}
                    >
                      <Trash2 size={14} />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Formats : PNG, JPG, SVG, WebP. Aperçu instantané.
                </span>
              </div>
            </div>
          </div>

          {/* 2. Nom & Secteur */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Nom commercial de l'entreprise *
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
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Secteur d'activité *
              </label>
              <select
                value={formData.secteur}
                onChange={e => setFormData({ ...formData, secteur: e.target.value })}
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.92rem',
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

          {/* 3. Couleurs Principale & Secondaire */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
              Couleur principale de votre marque
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {presetColors.map(col => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setFormData({ ...formData, couleur_principale: col })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: col,
                    border: formData.couleur_principale === col ? '3px solid white' : '2px solid transparent',
                    cursor: 'pointer',
                    transform: formData.couleur_principale === col ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}

              <input
                type="color"
                value={formData.couleur_principale}
                onChange={e => setFormData({ ...formData, couleur_principale: e.target.value })}
                style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: 'transparent' }}
              />
              <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                {formData.couleur_principale}
              </span>
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
              Couleur secondaire
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <input
                type="color"
                value={formData.couleur_secondaire}
                onChange={e => setFormData({ ...formData, couleur_secondaire: e.target.value })}
                style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: 'transparent' }}
              />
              <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                {formData.couleur_secondaire}
              </span>
            </div>
          </div>

          {/* 4. Coordonnées & Adresse */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Téléphone / WhatsApp
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem 0.75rem 2.4rem',
                      color: 'white',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Email de contact
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem 0.75rem 2.4rem',
                      color: 'white',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Adresse physique / Ville
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="Ex: Abidjan - Cocody, Dakar - Almadies..."
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem 0.75rem 2.4rem',
                    color: 'white',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg btn-glow"
            style={{ width: '100%', backgroundColor: formData.couleur_principale }}
          >
            {saving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
          </button>
        </form>

        {/* Right Live Client View Preview */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Aperçu en direct du lien de paiement reçu par vos clients :
            </span>
          </div>

          <div className="phone-mockup" style={{ maxWidth: '380px' }}>
            <div className="phone-screen">
              {/* Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${formData.couleur_principale} 0%, ${formData.couleur_secondaire} 100%)`,
                  padding: '1.5rem 1rem',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'white',
                    margin: '0 auto 0.65rem auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Building2 size={28} color="#0f172a" />
                  )}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{formData.nom || 'Votre Entreprise'}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>DEMANDE DE PAIEMENT SÉCURISÉE</div>
              </div>

              {/* Sample Payment Box */}
              <div style={{ padding: '1.25rem', background: '#f8fafc', color: '#0f172a' }}>
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Montant à payer</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: formData.couleur_principale }}>
                    50 000 FCFA
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Motif : Prestation de services / facture
                  </div>
                </div>

                <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '0.65rem', fontSize: '0.72rem', color: '#475569', marginBottom: '1rem' }}>
                  <div>📞 {formData.telephone || '+225 ...'}</div>
                  <div>✉️ {formData.email || 'contact@...'}</div>
                  <div>📍 {formData.adresse || 'Adresse de l\'entreprise'}</div>
                </div>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    background: formData.couleur_principale,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Lock size={14} />
                  <span>Payer en ligne</span>
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.65rem', color: '#94a3b8' }}>
                  <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  Infrastructure sécurisée Relancio
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
