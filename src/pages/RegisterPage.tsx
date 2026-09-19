import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import type { SupportedLocale } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, Building2, User, Mail, Phone, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t, locale, setLocale, isRtl } = useLanguage();

  const [formData, setFormData] = useState({
    nom_entreprise: '',
    responsable: '',
    email: '',
    telephone: '',
    secteur: 'Pressing',
    password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (formData.password.length < 6) {
      setError(t.auth.passwordMinLength);
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate('/entreprise');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputPadding = isRtl
    ? '0.65rem 2.25rem 0.65rem 0.85rem'
    : '0.65rem 0.85rem 0.65rem 2.25rem';
  const iconStyle = isRtl
    ? { position: 'absolute' as const, right: '12px', top: '50%', transform: 'translateY(-50%)' }
    : { position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Simple Header */}
      <header style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/" className="brand-logo-link">
            <div className="brand-logo-icon" style={{ width: '32px', height: '32px' }}>
              <Sparkles size={18} />
            </div>
            <span className="brand-logo-text" style={{ fontSize: '1.15rem' }}>Relancio</span>
            <span className="brand-logo-tag" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>SaaS</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Language Switcher */}
            <div
              style={{
                display: 'inline-flex',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {(['fr', 'en', 'ar'] as SupportedLocale[]).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLocale(lang)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-xs)',
                    border: 'none',
                    cursor: 'pointer',
                    background: locale === lang ? 'var(--primary)' : 'transparent',
                    color: locale === lang ? '#0b0f19' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {t.auth.alreadyAccount}{' '}
              <Link to="/connexion" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                {t.auth.signIn}
              </Link>
            </div>
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
              <span>{t.auth.registerBadge}</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
              {t.auth.registerTitle}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {t.auth.registerSubtitle}
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
                  {t.auth.companyName} *
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={15} color="#64748b" style={iconStyle} />
                  <input
                    type="text"
                    required
                    value={formData.nom_entreprise}
                    onChange={e => setFormData({ ...formData, nom_entreprise: e.target.value })}
                    placeholder={locale === 'ar' ? 'مثال: مغسلة السلام النموذجية' : 'Ex: Pressing Moderne Dakar'}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: inputPadding,
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {t.auth.fullName} *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#64748b" style={iconStyle} />
                  <input
                    type="text"
                    required
                    value={formData.responsable}
                    onChange={e => setFormData({ ...formData, responsable: e.target.value })}
                    placeholder={locale === 'ar' ? 'مثال: أحمد المنصوري' : 'Ex: Amadou Diallo'}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: inputPadding,
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
                  {t.settings.professionalEmail} *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#64748b" style={iconStyle} />
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
                      padding: inputPadding,
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                      direction: 'ltr',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {t.auth.phone} *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="#64748b" style={iconStyle} />
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
                      padding: inputPadding,
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                      direction: 'ltr',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Secteur d'activité */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {t.auth.sector} *
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
                <option value="Pressing">{t.auth.sectors.pressing}</option>
                <option value="École">{t.auth.sectors.ecole}</option>
                <option value="Garage">{t.auth.sectors.garage}</option>
                <option value="Salon">{t.auth.sectors.salon}</option>
                <option value="Commerce">{t.auth.sectors.commerce}</option>
                <option value="Artisan">{t.auth.sectors.artisan}</option>
                <option value="Services">{t.auth.sectors.services}</option>
                <option value="Autre">{t.auth.sectors.autre}</option>
              </select>
            </div>

            {/* Mot de passe & Confirmation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {t.auth.password} *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#64748b" style={iconStyle} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={locale === 'ar' ? '6 أحرف على الأقل' : 'Au moins 6 caractères'}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 2.25rem',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                      direction: 'ltr',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    title={showPassword ? 'Masquer' : 'Afficher'}
                    style={{
                      position: 'absolute',
                      [isRtl ? 'left' : 'right']: '10px',
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {t.auth.confirmPassword} *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#64748b" style={iconStyle} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirm_password}
                    onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder={locale === 'ar' ? 'كرر كلمة المرور' : 'Répétez le mot de passe'}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 2.25rem',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                      direction: 'ltr',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    title={showConfirmPassword ? 'Masquer' : 'Afficher'}
                    style={{
                      position: 'absolute',
                      [isRtl ? 'left' : 'right']: '10px',
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-glow"
              style={{ marginTop: '0.35rem', width: '100%', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              {loading ? (
                <span>{t.auth.creatingAccount}</span>
              ) : (
                <>
                  <span>{t.auth.registerBtn}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
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
              <span>{t.auth.guaranteeNoSubscription}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--primary)" />
              <span>{t.auth.guaranteeSecure}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--primary)" />
              <span>{t.auth.guaranteeInstantAccess}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
