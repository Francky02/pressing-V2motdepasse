import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Building2, User, Mail, Phone, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nom_entreprise: '',
    responsable: '',
    email: '',
    telephone: '',
    secteur: 'Pressing',
    password: '',
    confirm_password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      // Auto-connect and redirect to /entreprise
      navigate('/entreprise');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Simple Header */}
      <header style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="brand-logo-link">
            <div className="brand-logo-icon" style={{ width: '32px', height: '32px' }}>
              <Sparkles size={18} />
            </div>
            <span className="brand-logo-text" style={{ fontSize: '1.15rem' }}>Relancio</span>
            <span className="brand-logo-tag" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>SaaS</span>
          </Link>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Déjà un compte ?{' '}
            <Link to="/connexion" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem 1rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '580px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem 1.75rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.15rem' }}>
            <div className="badge-pill" style={{ marginBottom: '0.5rem', padding: '0.2rem 0.65rem', fontSize: '0.75rem' }}>
              <Building2 size={13} />
              <span>Création de compte Entreprise</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
              Commencer avec Relancio
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Enregistrez vos créances et facilitez les paiements de vos clients dès aujourd'hui.
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#fb7185',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.82rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Nom Entreprise & Responsable */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Nom de l'entreprise *
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    value={formData.nom_entreprise}
                    onChange={e => setFormData({ ...formData, nom_entreprise: e.target.value })}
                    placeholder="Ex: Pressing Moderne Dakar"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Nom du responsable *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    value={formData.responsable}
                    onChange={e => setFormData({ ...formData, responsable: e.target.value })}
                    placeholder="Ex: Amadou Diallo"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Email & Téléphone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Email professionnel *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@entreprise.com"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Téléphone / WhatsApp *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+225 07 00 00 00"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Secteur d'activité */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Secteur d'activité principal *
              </label>
              <select
                value={formData.secteur}
                onChange={e => setFormData({ ...formData, secteur: e.target.value })}
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  color: 'white',
                  fontSize: '0.88rem',
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
                <option value="Autre">Autre activité professionnelle</option>
              </select>
            </div>

            {/* Mot de passe & Confirmation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Mot de passe *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Au moins 6 caractères"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Confirmer le mot de passe *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    value={formData.confirm_password}
                    onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="Répétez le mot de passe"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-glow"
              style={{ marginTop: '0.35rem', width: '100%', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              {loading ? (
                <span>Création du compte en cours...</span>
              ) : (
                <>
                  <span>Créer mon compte entreprise</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Guarantees */}
          <div
            style={{
              marginTop: '1.15rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--primary)" />
              <span>0€ d'abonnement obligatoire</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--primary)" />
              <span>Données isolées et sécurisées</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--primary)" />
              <span>Accès immédiat</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
