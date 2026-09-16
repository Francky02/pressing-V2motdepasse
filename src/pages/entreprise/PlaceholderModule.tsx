import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderProps {
  moduleName: string;
  moduleIcon: string;
  moduleDescription: string;
}

export const PlaceholderModule: React.FC<PlaceholderProps> = ({
  moduleName,
  moduleIcon,
  moduleDescription,
}) => {
  const { company } = useAuth();
  const primaryColor = company?.couleur_principale || '#10b981';

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', textAlign: 'center' }}>
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '3.5rem 2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            fontSize: '3rem',
            marginBottom: '1rem',
          }}
        >
          {moduleIcon}
        </div>

        <div className="badge-pill" style={{ marginBottom: '1rem' }}>
          <Construction size={14} />
          <span>Module en préparation pour la prochaine étape</span>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
          Module {moduleName}
        </h2>

        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
          {moduleDescription}
        </p>

        {/* Tenant Scope Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.5rem',
            maxWidth: '480px',
            margin: '0 auto 2rem auto',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: primaryColor, fontWeight: 700, marginBottom: '0.35rem' }}>
            <ShieldCheck size={16} />
            <span>Architecture prête & isolation activée</span>
          </div>
          <div>Entreprise : <strong>{company?.nom}</strong></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Identifiant tenant : <code>{company?.id}</code></div>
        </div>

        <Link
          to="/entreprise"
          className="btn btn-primary"
          style={{ backgroundColor: primaryColor }}
        >
          <span>Retourner au Tableau de bord</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
