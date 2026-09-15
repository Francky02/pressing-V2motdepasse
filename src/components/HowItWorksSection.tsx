import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  FileSignature,
  Send,
  BellRing,
  CreditCard,
  BellCheck,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage();

  const timelineSteps = [
    {
      stepNumber: 1,
      title: "1. Créez votre créance",
      desc: "Renseignez en quelques clics le montant dû, la prestation ou l’article concerné et le contact WhatsApp ou SMS du client débiteur.",
      badge: "Moins de 30 secondes",
      icon: <FileSignature size={22} />,
      color: "#0ea5e9",
    },
    {
      stepNumber: 2,
      title: "2. Envoyez la demande",
      desc: "Relancio produit automatiquement un lien de règlement personnalisé avec votre logo, vos coordonnées et votre identité graphique.",
      badge: "Lien personnalisé généré",
      icon: <Send size={22} />,
      color: "#6366f1",
    },
    {
      stepNumber: 3,
      title: "3. Relancez votre client",
      desc: "Fini la gêne de réclamer votre argent. Relancio envoie des relances courtoises, automatisées et programmées selon vos préférences.",
      badge: "Zéro friction relationnelle",
      icon: <BellRing size={22} />,
      color: "#ec4899",
    },
    {
      stepNumber: 4,
      title: "4. Le client paie",
      desc: "Votre client clique sur le lien depuis son smartphone et sélectionne son mode de paiement préféré (Mobile Money, Carte, Virement).",
      badge: "Paiement en 1 clic",
      icon: <CreditCard size={22} />,
      color: "#f59e0b",
    },
    {
      stepNumber: 5,
      title: "5. Vous êtes informé",
      desc: "Dès que l'opération financière aboutit, vous recevez une notification en temps réel. Un reçu est automatiquement délivré au client.",
      badge: "Alerte instantanée",
      icon: <BellCheck size={22} />,
      color: "#14b8a6",
    },
    {
      stepNumber: 6,
      title: "6. La créance est clôturée",
      desc: "Le solde restant passe à zéro, vos statistiques de recouvrement sont actualisées et l’argent est immédiatement versé sur votre compte.",
      badge: "Trésorerie encaissée",
      icon: <CheckCircle size={22} />,
      color: "#10b981",
    },
  ];

  return (
    <section id="comment-ca-marche" className="section" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-tag">
            <Clock size={16} />
            <span>{t.howItWorks.tag}</span>
          </div>
          <h2 className="section-title">
            {t.howItWorks.title}
          </h2>
          <p className="section-subtitle">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* Vertical Animated Timeline Track */}
        <div className="timeline-track">
          {timelineSteps.map(item => (
            <div key={item.stepNumber} className="timeline-item">
              <div
                className="timeline-dot"
                style={{
                  borderColor: item.color,
                  color: item.color,
                  boxShadow: `0 0 15px ${item.color}33`,
                }}
              >
                {item.icon}
              </div>

              <div
                className="glass-card"
                style={{
                  flex: 1,
                  padding: '1.5rem',
                  borderLeft: `3px solid ${item.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-white)' }}>
                    {item.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: item.color,
                      background: `${item.color}15`,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
