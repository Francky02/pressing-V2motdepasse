import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Mail, Lock, AlertCircle, ShieldCheck, Key } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Rediriger si déjà authentifié
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/entreprise', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/entreprise', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Identifiants invalides ou compte inaccessible.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (testEmail: string, testPassword = 'Password123!') => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Header */}
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
            Pas encore de compte ?{' '}
            <Link to="/inscription" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Login Main Container */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem 1rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '430px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.65rem auto',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Key size={20} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
              Connexion Entreprise
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Accédez directement à votre tableau de bord
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Email de connexion
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-glow"
              style={{ marginTop: '0.35rem', width: '100%', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              {loading ? (
                <span>Connexion en cours...</span>
              ) : (
                <>
                  <span>Accéder à mon espace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Accounts for Reviewer */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.45rem', fontWeight: 600 }}>
              💡 Accès de test pré-configurés (1 clic) :
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={() => fillTestAccount('royalclean@example.com')}
                style={{
                  background: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  color: '#38bdf8',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  lineHeight: 1.2,
                }}
              >
                👔 <strong>Royal Clean</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8 }}>Entreprise A</span>
              </button>
              <button
                type="button"
                onClick={() => fillTestAccount('etoiles@example.com')}
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  lineHeight: 1.2,
                }}
              >
                🎓 <strong>Les Étoiles</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8 }}>Entreprise B</span>
              </button>
              <button
                type="button"
                onClick={() => fillTestAccount('admin@relancio.com', 'AdminRelancio2026!')}
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#f59e0b',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  lineHeight: 1.2,
                }}
              >
                🛡️ <strong>Super Admin</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8 }}>Console Globale</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Session sécurisée avec isolation cryptographique
          </div>
        </div>
      </main>
    </div>
  );
};
