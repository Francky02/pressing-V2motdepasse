import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { HeroInteractiveFlow } from './HeroInteractiveFlow';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Building2,
  CheckCircle,
} from 'lucide-react';

interface HeroProps {
  onOpenOnboarding: () => void;
  onExploreDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenOnboarding, onExploreDemo }) => {
  const { t } = useLanguage();

  return (
    <section className="section bg-grid-pattern" style={{ paddingTop: '7.5rem', paddingBottom: '4.5rem' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Copy & CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Tagline Badge */}
            <div className="badge-pill animate-badge">
              <Sparkles size={14} />
              <span>{t.hero.taglineBadge}</span>
            </div>

            {/* Main H1 Title */}
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                color: 'var(--text-white)',
                letterSpacing: '-1px',
              }}
            >
              {t.hero.titlePart1}{' '}
              <span className="gradient-text">{t.hero.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.6vw, 1.25rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '560px',
              }}
            >
              {t.hero.subtitle}
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                marginTop: '0.5rem',
              }}
            >
              <button
                type="button"
                className="btn btn-primary btn-lg btn-glow"
                onClick={onOpenOnboarding}
                id="hero-cta-get-started"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={onExploreDemo}
                id="hero-cta-discover"
              >
                <span>{t.hero.ctaSecondary}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={16} color="var(--primary)" />
                <span>{t.hero.badge1}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                <Zap size={16} color="#38bdf8" />
                <span>{t.hero.badge2}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                <Building2 size={16} color="#a855f7" />
                <span>{t.hero.badge3}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Interactive Flow Visual */}
          <div style={{ position: 'relative' }}>
            <HeroInteractiveFlow />
          </div>
        </div>
      </div>
    </section>
  );
};
