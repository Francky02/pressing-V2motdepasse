import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Sparkles, Shield } from 'lucide-react';
import type { SupportedLocale } from '../types';

export const Footer: React.FC = () => {
  const { t, locale, setLocale } = useLanguage();

  return (
    <footer style={{ backgroundColor: '#070a12', borderTop: '1px solid var(--border-subtle)', padding: '4.5rem 0 2rem 0' }}>
      <div className="container">
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Col 1: Brand */}
          <div>
            <a href="#" className="brand-logo-link" style={{ marginBottom: '1rem' }}>
              <div className="brand-logo-icon">
                <Sparkles size={22} />
              </div>
              <span className="brand-logo-text">Relancio</span>
              <span className="brand-logo-tag">SaaS</span>
            </a>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {t.footer.tagline}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Shield size={14} color="var(--primary)" />
              <span>Conforme aux normes de sécurité bancaire</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li><a href="#probleme" style={{ color: 'var(--text-secondary)' }}>{t.nav.features}</a></li>
              <li><a href="#secteurs" style={{ color: 'var(--text-secondary)' }}>{t.nav.sectors}</a></li>
              <li><a href="#personnalisation" style={{ color: 'var(--text-secondary)' }}>{t.nav.customization}</a></li>
              <li><a href="#comment-ca-marche" style={{ color: 'var(--text-secondary)' }}>{t.nav.howItWorks}</a></li>
              <li><a href="#modele-eco" style={{ color: 'var(--text-secondary)' }}>{t.nav.pricing}</a></li>
              <li><a href="#dashboard" style={{ color: 'var(--text-secondary)' }}>{t.nav.dashboard}</a></li>
            </ul>
          </div>

          {/* Col 3: Secteurs */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Métiers & Secteurs
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li>Pressings & Blanchisseries</li>
              <li>Écoles & Établissements</li>
              <li>Garages & Mécanique Auto</li>
              <li>Salons de Coiffure & Beauté</li>
              <li>Boutiques & Commerces</li>
              <li>Artisans, BTP & Agences</li>
            </ul>
          </div>

          {/* Col 4: International & Language */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Langues & Régions
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Architecture prête pour le déploiement international francophone et multilingue :
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['fr', 'en', 'ar'] as SupportedLocale[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  style={{
                    background: locale === l ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                    color: locale === l ? '#0b0f19' : 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {l === 'fr' ? 'Français' : l === 'en' ? 'English' : 'العربية'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Relancio. {t.footer.rights}
          </div>
          <div>
            {t.footer.independentNote}
          </div>
        </div>
      </div>
    </footer>
  );
};
