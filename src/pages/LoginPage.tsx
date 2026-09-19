import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import type { SupportedLocale } from '../types';
import { Sparkles, ArrowRight, Mail, Lock, AlertCircle, ShieldCheck, Key, Globe, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { t, locale, setLocale, isRTL } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const cleanIdentifier = email.trim();
      const loggedInUser = await login(cleanIdentifier, password);
      if (loggedInUser.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/entreprise', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.common.error;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.45rem', borderRadius: '6px' }}>
              <Globe size={13} color="var(--text-muted)" />
              {(['fr', 'en', 'ar'] as SupportedLocale[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  style={{
                    background: locale === l ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                    border: locale === l ? '1px solid #10b981' : '1px solid transparent',
                    borderRadius: '4px',
                    color: locale === l ? 'white' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {t.auth.noAccount}{' '}
              <Link to="/inscription" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                {t.auth.signUp}
              </Link>
            </div>
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
              {t.auth.loginTitle}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {t.auth.loginSubtitle}
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
                {t.auth.emailOrPhone}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#64748b" style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={locale === 'ar' ? 'البريد أو الهاتف' : '+225 07... ou contact@entreprise.com'}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: isRTL ? '0.65rem 2.25rem 0.65rem 0.85rem' : '0.65rem 0.85rem 0.65rem 2.25rem',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t.auth.password}
                </label>
                <Link
                  to="/mot-de-passe-oublie"
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#64748b" style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: isRTL ? '0.65rem 2.25rem 0.65rem 2.25rem' : '0.65rem 2.25rem 0.65rem 2.25rem',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                  style={{
                    position: 'absolute',
                    [isRTL ? 'left' : 'right']: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: showPassword ? 'var(--primary)' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-glow"
              style={{ marginTop: '0.35rem', width: '100%', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              {loading ? (
                <span>{t.common.loading}</span>
              ) : (
                <>
                  <span>{t.auth.loginBtn}</span>
                  <ArrowRight size={16} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
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
              💡 {t.auth.demoAccounts} :
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
                  textAlign: isRTL ? 'right' : 'left',
                  lineHeight: 1.2,
                }}
              >
                👔 <strong>Royal Clean</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8 }}>Pressing A</span>
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
                  textAlign: isRTL ? 'right' : 'left',
                  lineHeight: 1.2,
                }}
              >
                🎓 <strong>Les Étoiles</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8 }}>École B</span>
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
                  textAlign: isRTL ? 'right' : 'left',
                  lineHeight: 1.2,
                }}
              >
                🛡️ <strong>Super Admin</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8 }}>Console</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={13} style={{ display: 'inline', marginInlineEnd: '4px', verticalAlign: 'middle' }} />
            {t.auth.sessionEncrypted}
          </div>
        </div>
      </main>
    </div>
  );
};
