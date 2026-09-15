import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface CTAProps {
  onOpenOnboarding: () => void;
}

export const CTASection: React.FC<CTAProps> = ({ onOpenOnboarding }) => {

  return (
    <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(2.5rem, 5vw, 4.5rem) clamp(1.5rem, 4vw, 3rem)',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(16, 185, 129, 0.2)',
            position: 'relative',
          }}
        >
          <div className="badge-pill animate-badge" style={{ marginBottom: '1.25rem' }}>
            <Sparkles size={15} />
            <span>Accélérez vos rentrées d'argent dès aujourd'hui</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              maxWidth: '800px',
              margin: '0 auto 1.25rem auto',
            }}
          >
            Prêt à transformer vos créances en paiements réels ?
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: '620px',
              margin: '0 auto 2rem auto',
            }}
          >
            Rejoignez les professionnels qui sécurisent leur trésorerie sans abonnement fixe ni stress de relance.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <button
              type="button"
              className="btn btn-primary btn-lg btn-glow"
              onClick={onOpenOnboarding}
            >
              <span>Commencer gratuitement maintenant</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} color="var(--primary)" />
              <span>Zéro abonnement fixe</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} color="var(--primary)" />
              <span>Configuration en 2 minutes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Sécurité bancaire garantie</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
