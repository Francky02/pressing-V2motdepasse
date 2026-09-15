import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Shirt,
  GraduationCap,
  Wrench,
  Sparkles,
  ShoppingBag,
  Hammer,
  Briefcase,
  Layers,
  Check,
} from 'lucide-react';
import type { SectorType } from '../types';

interface SectorCardData {
  id: SectorType;
  title: string;
  icon: React.ReactNode;
  tagline: string;
  typicalCases: string[];
  sampleDebt: string;
  badge: string;
  color: string;
}

export const MultiSectorSection: React.FC = () => {
  const { t } = useLanguage();
  const [selectedSector, setSelectedSector] = useState<SectorType>('pressing');

  const sectorCards: SectorCardData[] = [
    {
      id: 'pressing',
      title: 'Pressings & Blanchisseries',
      icon: <Shirt size={28} />,
      tagline: 'Soldez les dépôts de linge et forfaits pressing sans litiges',
      typicalCases: [
        'Clients réguliers qui récupèrent sans payer immédiatement',
        'Lots de couettes, rideaux et costumes haut de gamme',
        'Contrats d’hôtels et uniformes d’entreprises',
      ],
      sampleDebt: 'Exemple : 35 000 FCFA pour 5 costumes & 10 chemises',
      badge: 'Zéro oubli au retrait',
      color: '#0ea5e9',
    },
    {
      id: 'ecole',
      title: 'Écoles & Établissements',
      icon: <GraduationCap size={28} />,
      tagline: 'Facilitez le recouvrement des frais de scolarité pour les parents',
      typicalCases: [
        'Mensualités scolaires et relances respectueuses',
        'Frais de cantine, transport et fournitures',
        'Activités parascolaires et cours de soutien',
      ],
      sampleDebt: 'Exemple : 120 000 FCFA de scolarité Trimestre 2',
      badge: 'Relations parents apaisées',
      color: '#10b981',
    },
    {
      id: 'garage',
      title: 'Garages & Mécanique Auto',
      icon: <Wrench size={28} />,
      tagline: 'Faites régler les pièces détachées et la main-d’œuvre sans retard',
      typicalCases: [
        'Véhicules réparés et restitués en attente de virement',
        'Acomptes sur commandes de pièces mécaniques',
        'Entretien de flotte automobile professionnelle',
      ],
      sampleDebt: 'Exemple : 240 000 FCFA kit d’embrayage + révision',
      badge: 'Encaissement avant restitution',
      color: '#f59e0b',
    },
    {
      id: 'salon',
      title: 'Salons de Beauté & Spas',
      icon: <Sparkles size={28} />,
      tagline: 'Sécurisez les acomptes de réservation et prestations prestige',
      typicalCases: [
        'Forfaits mariage et événements de week-end',
        'Soins esthétiques, tissages et perruques de luxe',
        'Cartes d’abonnement mensuel et cures minceur',
      ],
      sampleDebt: 'Exemple : 65 000 FCFA Forfait mariée & coiffure',
      badge: 'Fidélisation sans impayé',
      color: '#ec4899',
    },
    {
      id: 'commerce',
      title: 'Boutiques & Commerçants',
      icon: <ShoppingBag size={28} />,
      tagline: 'En finissez avec les crédits informels notés sur des carnets',
      typicalCases: [
        'Ventes à tempérament sur vêtements, tissus et prêt-à-porter',
        'Commandes sur mesure d’articles importés',
        'Clients VIP avec facilité de paiement en 2 ou 3 fois',
      ],
      sampleDebt: 'Exemple : 85 000 FCFA solde tissus Bazin brodés',
      badge: 'Fin des carnets de crédit perdus',
      color: '#8b5cf6',
    },
    {
      id: 'artisan',
      title: 'Artisans & BTP',
      icon: <Hammer size={28} />,
      tagline: 'Faites respecter les échéances de chantiers et finitions',
      typicalCases: [
        'Menuiserie, aluminium, soudure et vitrerie',
        'Plomberie, électricité et rénovation intérieure',
        'Acomptes de démarrage et solde de réception de travaux',
      ],
      sampleDebt: 'Exemple : 350 000 FCFA solde travaux peinture villa',
      badge: 'Trésorerie de chantier garantie',
      color: '#14b8a6',
    },
    {
      id: 'services',
      title: 'Entreprises de Services & Agences',
      icon: <Briefcase size={28} />,
      tagline: 'Accélérez l’encaissement de vos honoraires et livrables',
      typicalCases: [
        'Agences de communication, graphisme et web',
        'Cabinets de conseil, comptabilité et juridique',
        'Maintenance informatique et infogérance',
      ],
      sampleDebt: 'Exemple : 500 000 FCFA facture de refonte digitale',
      badge: 'Paiement avant clôture de mission',
      color: '#6366f1',
    },
    {
      id: 'autre',
      title: 'Autres Professionnels & Indépendants',
      icon: <Layers size={28} />,
      tagline: 'Toute activité accordant des facilités ou constatant des retards',
      typicalCases: [
        'Consultants, formateurs et coachs indépendants',
        'Professionnels de santé et cliniques privées',
        'Prestataires événementiels, traiteurs et photographes',
      ],
      sampleDebt: 'Exemple : 150 000 FCFA couverture shooting photo événement',
      badge: 'Universel & immédiatement opérationnel',
      color: '#06b6d4',
    },
  ];

  return (
    <section id="secteurs" className="section" style={{ backgroundColor: 'rgba(11, 15, 25, 0.7)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Layers size={16} />
            <span>{t.sectors.tag}</span>
          </div>
          <h2 className="section-title">
            {t.sectors.title}
          </h2>
          <p className="section-subtitle">
            {t.sectors.subtitle}
          </p>
        </div>

        {/* Sectors Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {sectorCards.map(s => {
            const isSelected = selectedSector === s.id;
            return (
              <div
                key={s.id}
                className={`sector-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedSector(s.id)}
                style={{
                  borderLeft: `4px solid ${s.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${s.color}15`,
                      color: s.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${s.color}33`,
                    }}
                  >
                    {s.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-secondary)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {s.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.18rem',
                    fontWeight: 700,
                    color: 'var(--text-white)',
                    marginBottom: '0.45rem',
                  }}
                >
                  {s.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                  }}
                >
                  {s.tagline}
                </p>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Cas d’usage fréquents :
                  </span>
                  {s.typicalCases.slice(0, 2).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Check size={14} color={s.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: `${s.color}10`,
                    border: `1px solid ${s.color}25`,
                    fontSize: '0.78rem',
                    color: s.color,
                    fontWeight: 600,
                  }}
                >
                  {s.sampleDebt}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
