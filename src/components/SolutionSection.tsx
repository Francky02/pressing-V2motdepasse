import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  FilePlus,
  Send,
  BellRing,
  CreditCard,
  CheckCheck,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const SolutionSection: React.FC = () => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: t.solution.s1Title,
      desc: t.solution.s1Desc,
      icon: <FilePlus size={24} />,
      detail: "Client : nom, numéro WhatsApp, montant, motif et date limite",
      badge: "Saisie express en 15s",
    },
    {
      num: '02',
      title: t.solution.s2Title,
      desc: t.solution.s2Desc,
      icon: <Send size={24} />,
      detail: "Lien de paiement chiffré, habillé avec votre logo et vos coordonnées",
      badge: "Lien personnalisé",
    },
    {
      num: '03',
      title: t.solution.s3Title,
      desc: t.solution.s3Desc,
      icon: <BellRing size={24} />,
      detail: "Relances programmées et cordiales sans que vous ayez à composer un mot",
      badge: "Zéro gêne client",
    },
    {
      num: '04',
      title: t.solution.s4Title,
      desc: t.solution.s4Desc,
      icon: <CreditCard size={24} />,
      detail: "Mobile Money (Wave, Orange, MTN, Moov) et Cartes bancaires sécurisées",
      badge: "Multi-moyens de paiement",
    },
    {
      num: '05',
      title: t.solution.s5Title,
      desc: t.solution.s5Desc,
      icon: <CheckCheck size={24} />,
      detail: "Notification push immédiate et reçu automatique délivré au client",
      badge: "Validation instantanée",
    },
    {
      num: '06',
      title: t.solution.s6Title,
      desc: t.solution.s6Desc,
      icon: <RefreshCw size={24} />,
      detail: "Statut 'Soldé' enregistré et fonds disponibles directement pour votre activité",
      badge: "Trésorerie assainie",
    },
  ];

  return (
    <section id="solution" className="section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={16} />
            <span>{t.solution.tag}</span>
          </div>
          <h2 className="section-title">
            {t.solution.title}
          </h2>
          <p className="section-subtitle">
            {t.solution.subtitle}
          </p>
        </div>

        {/* 6 Grid Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="solution-step-card"
              onMouseEnter={() => setActiveStep(idx)}
              style={{
                borderColor: activeStep === idx ? 'var(--primary)' : 'rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="solution-step-num">
                  {step.num}
                </div>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  {step.icon}
                </div>
              </div>

              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text-white)',
                  marginBottom: '0.65rem',
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                }}
              >
                {step.desc}
              </p>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                }}
              >
                <strong>Détail :</strong> {step.detail}
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                <ShieldCheck size={14} />
                <span>{step.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
