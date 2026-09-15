import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Sparkles, Menu, X, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import type { SupportedLocale } from '../types';

interface NavbarProps {
  onOpenOnboarding: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOnboarding, onOpenLogin }) => {
  const { t, locale, setLocale } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header
      className={`navbar-wrapper ${isScrolled ? 'navbar-scrolled' : ''}`}
      style={{
        backgroundColor: isScrolled ? 'rgba(11, 15, 25, 0.94)' : 'rgba(11, 15, 25, 0.8)',
        boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <div className="navbar-inner">
        {/* Brand Logo */}
        <a href="#" className="brand-logo-link" onClick={closeMobile}>
          <div className="brand-logo-icon">
            <Sparkles size={22} />
          </div>
          <span className="brand-logo-text">Relancio</span>
          <span className="brand-logo-tag">SaaS</span>
        </a>

        {/* Desktop Links */}
        <nav className="nav-links-desktop">
          <li className="nav-link-item">
            <a href="#probleme">{t.nav.features}</a>
          </li>
          <li className="nav-link-item">
            <a href="#secteurs">{t.nav.sectors}</a>
          </li>
          <li className="nav-link-item">
            <a href="#personnalisation">{t.nav.customization}</a>
          </li>
          <li className="nav-link-item">
            <a href="#comment-ca-marche">{t.nav.howItWorks}</a>
          </li>
          <li className="nav-link-item">
            <a href="#modele-eco">{t.nav.pricing}</a>
          </li>
          <li className="nav-link-item">
            <a href="#dashboard">{t.nav.dashboard}</a>
          </li>
        </nav>

        {/* Right Actions: Lang + Auth CTA */}
        <div className="nav-actions">
          {/* Language Selector */}
          <div className="lang-selector" title="Changer de langue / Change language">
            {(['fr', 'en', 'ar'] as SupportedLocale[]).map(lang => (
              <button
                key={lang}
                type="button"
                className={`lang-btn ${locale === lang ? 'active' : ''}`}
                onClick={() => setLocale(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenLogin}
            style={{ display: 'none' /* hidden on very small, shown on md+ */ }}
          >
            <UserCheck size={16} />
            <span>{t.nav.login}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm btn-glow"
            onClick={onOpenOnboarding}
          >
            <span>{t.nav.getStarted}</span>
            <ArrowRight size={16} />
          </button>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Navigation Relancio</span>
            <div className="lang-selector">
              {(['fr', 'en', 'ar'] as SupportedLocale[]).map(lang => (
                <button
                  key={lang}
                  type="button"
                  className={`lang-btn ${locale === lang ? 'active' : ''}`}
                  onClick={() => {
                    setLocale(lang);
                    closeMobile();
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <ul className="mobile-drawer-links">
            <li>
              <a href="#probleme" onClick={closeMobile}>
                <span>{t.nav.features}</span>
                <ArrowRight size={18} color="var(--primary)" />
              </a>
            </li>
            <li>
              <a href="#secteurs" onClick={closeMobile}>
                <span>{t.nav.sectors}</span>
                <ArrowRight size={18} color="var(--primary)" />
              </a>
            </li>
            <li>
              <a href="#personnalisation" onClick={closeMobile}>
                <span>{t.nav.customization}</span>
                <ArrowRight size={18} color="var(--primary)" />
              </a>
            </li>
            <li>
              <a href="#comment-ca-marche" onClick={closeMobile}>
                <span>{t.nav.howItWorks}</span>
                <ArrowRight size={18} color="var(--primary)" />
              </a>
            </li>
            <li>
              <a href="#modele-eco" onClick={closeMobile}>
                <span>{t.nav.pricing}</span>
                <ArrowRight size={18} color="var(--primary)" />
              </a>
            </li>
            <li>
              <a href="#dashboard" onClick={closeMobile}>
                <span>{t.nav.dashboard}</span>
                <ArrowRight size={18} color="var(--primary)" />
              </a>
            </li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => {
                closeMobile();
                onOpenOnboarding();
              }}
            >
              <span>{t.nav.getStarted}</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                closeMobile();
                onOpenLogin();
              }}
            >
              <span>{t.nav.login}</span>
            </button>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span>Infrastructure bancaire sécurisée & multi-devises</span>
          </div>
        </div>
      )}
    </header>
  );
};
