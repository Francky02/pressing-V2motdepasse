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
    <div style={{ maxWidth: '900px', margin: '1rem auto', textAlign: 'center' }}>
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            fontSize: '2.5rem',
            marginBottom: '0.75rem',
          }}
        >
          {moduleIcon}
        </div>

        <div className="badge-pill" style={{ marginBottom: '0.75rem', padding: '0.2rem 0.65rem', fontSize: '0.75rem' }}>
          <Construction size={13} />
          <span>Module en préparation</span>
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
          Module {moduleName}
        </h2>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
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
