import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Clock,
  UserX,
  MessageSquareWarning,
  FileSpreadsheet,
  HelpCircle,
  CalendarX,
  EyeOff,
  AlertOctagon,
} from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const { t } = useLanguage();

  const problems = [
    {
      icon: <Clock size={22} />,
      title: t.problem.p1Title,
      desc: t.problem.p1Desc,
      stat: "42% des factures subissent un retard",
    },
    {
      icon: <UserX size={22} />,
      title: t.problem.p2Title,
      desc: t.problem.p2Desc,
      stat: "Gêne & rupture du lien commercial",
    },
    {
      icon: <MessageSquareWarning size={22} />,
      title: t.problem.p3Title,
      desc: t.problem.p3Desc,
      stat: "Informations éparpillées",
    },
    {
      icon: <FileSpreadsheet size={22} />,
      title: t.problem.p4Title,
      desc: t.problem.p4Desc,
      stat: "Erreurs & pertes de registres",
    },
    {
      icon: <HelpCircle size={22} />,
      title: t.problem.p5Title,
      desc: t.problem.p5Desc,
      stat: "Trésorerie fantôme inconnue",
    },
    {
      icon: <CalendarX size={22} />,
      title: t.problem.p6Title,
      desc: t.problem.p6Desc,
      stat: "Après 60 jours : 70% d'irrécouvrable",
    },
    {
      icon: <EyeOff size={22} />,
      title: t.problem.p7Title,
      desc: t.problem.p7Desc,
      stat: "Pilotage à l'aveugle",
    },
  ];

  return (
    <section id="probleme" className="section" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag" style={{ color: '#fb7185' }}>
            <AlertOctagon size={16} />
            <span>{t.problem.tag}</span>
          </div>
          <h2 className="section-title">
            {t.problem.title}
          </h2>
          <p className="section-subtitle">
            {t.problem.subtitle}
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {problems.map((prob, idx) => (
            <div key={idx} className="problem-card">
              <div className="problem-icon-wrapper">
                {prob.icon}
              </div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-white)',
                  marginBottom: '0.5rem',
                }}
              >
                {prob.title}
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  marginBottom: '1rem',
                }}
              >
                {prob.desc}
              </p>
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#fb7185',
                  background: 'rgba(244, 63, 94, 0.08)',
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {prob.stat}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
