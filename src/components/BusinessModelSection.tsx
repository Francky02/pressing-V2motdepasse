import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Coins,
  CheckCircle,
  XCircle,
  Percent,
  ArrowRight,
} from 'lucide-react';

interface BusinessModelProps {
  onOpenOnboarding: () => void;
}

export const BusinessModelSection: React.FC<BusinessModelProps> = ({ onOpenOnboarding }) => {
  const { t } = useLanguage();

  return (
    <section id="modele-eco" className="section bg-grid-pattern">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="badge-pill" style={{ marginBottom: '0.85rem' }}>
            <Coins size={15} />
            <span>{t.pricing.tag}</span>
          </div>
          <h2 className="section-title">
            {t.pricing.title}
          </h2>
          <p className="section-subtitle">
            {t.pricing.desc}
          </p>
        </div>

        {/* Main Highlight Hero Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(2rem, 4vw, 3.5rem)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.12)',
            maxWidth: '960px',
            margin: '0 auto 3rem auto',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Decorative Glow Blob */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'var(--primary)',
              filter: 'blur(80px)',
              opacity: 0.15,
              pointerEvents: 'none',
            }}
          />

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--primary)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.4rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '1rem',
                letterSpacing: '0.5px',
                marginBottom: '1rem',
              }}
            >
              {t.pricing.noSubscription}
            </span>

            <h3
              style={{
                fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: 1.2,
              }}
            >
              {t.pricing.payWhenCollected}
            </h3>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
              Relancio gagne sa vie uniquement lorsque vous encaissez. Vous ne prenez absolument aucun risque financier : zéro abonnement fixe obligatoire.
            </p>
          </div>

          {/* Comparison Row: Classic SaaS vs Relancio Win-Win */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            {/* Old School Subscription */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185', fontWeight: 700, marginBottom: '1rem' }}>
                <XCircle size={20} />
                <span>Logiciels classiques traditionnels</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <li>❌ Abonnement mensuel fixe même en cas d'impayés</li>
                <li>❌ Engagement sur 12 mois obligatoire</li>
                <li>❌ Frais d'installation et de configuration</li>
                <li>❌ Pénalités si vous encaissez moins un mois donné</li>
              </ul>
            </div>

            {/* Relancio Model */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem' }}>
                <CheckCircle size={20} />
                <span>L'approche vertueuse Relancio</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                <li>✅ <strong>0 FCFA / 0€</strong> d'abonnement fixe obligatoire</li>
                <li>✅ Accès complet et illimité à tous les modules</li>
                <li>✅ Commission minime prélevée uniquement au succès</li>
                <li>✅ Vous gardez le contrôle total de votre trésorerie</li>
              </ul>
            </div>
          </div>

          {/* Commission Placeholder Area (As specifically requested: "Créer seulement l'espace visuel prévu pour le futur modèle de commission") */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              <Percent size={16} />
              <span>Espace futur barème de commission au succès</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.25rem auto' }}>
              Les pourcentages de commission définitifs seront annoncés prochainement lors du lancement officiel des passerelles de paiement bancaire et Mobile Money.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-glow"
              onClick={onOpenOnboarding}
            >
              <span>{t.pricing.cta}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
