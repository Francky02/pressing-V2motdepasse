import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../services/api';
import type { SupportedLocale } from '../types';
import { Sparkles, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Globe, KeyRound } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t, locale, setLocale, isRTL } = useLanguage();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Vérification de la validité du token à l'arrivée sur la page
  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(t.auth.invalidTokenSubtitle);
          setVerifying(false);
        }
        return;
      }

      try {
        const data = await apiRequest<{ valid: boolean; error?: string }>(`/api/auth/verify-reset-token/${encodeURIComponent(token)}`);

        if (isMounted) {
          if (data.valid) {
            setTokenValid(true);
          } else {
            setTokenValid(false);
            setTokenError(data.error || t.auth.invalidTokenSubtitle);
          }
          setVerifying(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setTokenValid(false);
          const msg = err instanceof Error ? err.message : t.auth.invalidTokenSubtitle;
          setTokenError(msg);
          setVerifying(false);
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t.auth.passwordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    try {
      setLoading(true);
      await apiRequest<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* En-tête */}
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
            <Link
              to="/connexion"
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              <span>{t.auth.signIn}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {verifying ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(37, 99, 235, 0.2)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1.25rem',
                }}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t.common.loading}
              </p>
            </div>
          ) : !tokenValid ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#fb7185',
                }}
              >
                <AlertCircle size={26} />
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '0.35rem' }}>
                {t.auth.invalidTokenTitle}
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                {tokenError || t.auth.invalidTokenSubtitle}
              </p>

              <Link
                to="/mot-de-passe-oublie"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <span>{t.auth.requestNewLink}</span>
                {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#34d399',
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '0.35rem' }}>
                {t.auth.resetSuccessTitle}
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                {t.auth.resetSuccessSubtitle}
              </p>

              <Link
                to="/connexion"
                className="btn btn-primary btn-lg btn-glow"
                style={{
                  width: '100%',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <span>{t.auth.backToLogin}</span>
                {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: 'rgba(37, 99, 235, 0.15)',
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: 'var(--primary)',
                  }}
                >
                  <KeyRound size={26} />
                </div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', marginBottom: '0.35rem' }}>
                  {t.auth.resetPasswordTitle}
                </h1>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t.auth.resetPasswordSubtitle}
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
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    fontSize: '0.84rem',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    {t.auth.newPassword}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#64748b" style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: isRTL ? '0.75rem 2.5rem 0.75rem 2.5rem' : '0.75rem 2.5rem 0.75rem 2.5rem',
                        color: 'white',
                        fontSize: '0.9rem',
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
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    {t.auth.confirmNewPassword}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#64748b" style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: isRTL ? '0.75rem 2.5rem 0.75rem 2.5rem' : '0.75rem 2.5rem 0.75rem 2.5rem',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                      title={showConfirmPassword ? 'Masquer' : 'Afficher'}
                      style={{
                        position: 'absolute',
                        [isRTL ? 'left' : 'right']: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: showConfirmPassword ? 'var(--primary)' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg btn-glow"
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.92rem',
                  }}
                >
                  {loading ? (
                    <span>{t.common.loading}</span>
                  ) : (
                    <>
                      <span>{t.auth.resetPasswordBtn}</span>
                      {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
