import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const TestimonialsFAQ: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Relancio est-il réservé uniquement aux pressings ?",
      a: "Absolument pas ! Relancio a été pensé pour tous les professionnels qui accordent des facilités de paiement ou subissent des retards : écoles (scolarité), garages (réparations), salons de coiffure, commerces de détail, artisans BTP, agences de conseil et indépendants.",
    },
    {
      q: "Comment mes clients règlent-ils leur créance ?",
      a: "Vos clients reçoivent un lien de paiement personnalisé par WhatsApp ou SMS. En un clic depuis leur smartphone, ils accèdent à une page claire habillée à vos couleurs et peuvent régler par Mobile Money (Wave, Orange Money, MTN Moov) ou par Carte bancaire.",
    },
    {
      q: "Dois-je payer un abonnement si je n'encaisse rien un mois ?",
      a: "Non ! Relancio a fait le choix d'un modèle économique équitable sans abonnement obligatoire. Vous ne payez rien pour vous inscrire ou utiliser l'application. Seule une commission minime est prélevée lorsque nous vous aidons à encaisser effectivement.",
    },
    {
      q: "Mes clients voient-ils mon logo et mon nom d'entreprise ?",
      a: "Oui ! C'est l'un des piliers de Relancio : votre entreprise conserve 100% de son identité. Vous téléversez votre logo, définissez vos couleurs et vos coordonnées. Le client a l'assurance de payer directement votre enseigne de confiance.",
    },
    {
      q: "Mes relances risquent-elles de froisser mes clients réguliers ?",
      a: "Au contraire. Les messages de Relancio sont rédigés sur un ton professionnel, bienveillant et courtois. Le lien permet de simplifier l'acte de paiement pour le client sans discussion embarrassante au comptoir ou par téléphone.",
    },
    {
      q: "Quelles sont les devises supportées ?",
      a: "Relancio supporte le Franc CFA (XOF / XAF), le Dirham marocain (MAD), l'Euro (€) et le Dollar américain ($). Les devises et formats sont paramétrables en un clic.",
    },
  ];

  return (
    <section className="section" style={{ backgroundColor: 'rgba(11, 15, 25, 0.7)' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Header */}
        <div className="section-header">
          <div className="badge-pill" style={{ marginBottom: '0.85rem' }}>
            <HelpCircle size={15} />
            <span>Foire Aux Questions</span>
          </div>
          <h2 className="section-title">
            {t.faq.title}
          </h2>
          <p className="section-subtitle">
            {t.faq.subtitle}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-white)',
                    textAlign: 'left',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="#94a3b8" />}
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.5rem 1.5rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.94rem',
                      lineHeight: 1.65,
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '1rem',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
