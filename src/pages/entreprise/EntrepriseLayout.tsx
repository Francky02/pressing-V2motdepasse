import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BellRing,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const EntrepriseLayout: React.FC = () => {
  const { user, company, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-badge" size={36} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Chargement de votre espace sécurisé...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'ENTREPRISE_ADMIN') {
    return <Navigate to="/connexion" replace />;
  }

  const navItems = [
    { label: 'Tableau de bord', path: '/entreprise', icon: <LayoutDashboard size={18} /> },
    { label: 'Clients', path: '/entreprise/clients', icon: <Users size={18} /> },
    { label: 'Créances', path: '/entreprise/creances', icon: <FileText size={18} /> },
    { label: 'Paiements', path: '/entreprise/paiements', icon: <CreditCard size={18} /> },
    { label: 'Relances', path: '/entreprise/relances', icon: <BellRing size={18} /> },
    { label: 'Paramètres', path: '/entreprise/parametres', icon: <Settings size={18} /> },
  ];

  const handleLogout = () => {
    logout();
  };

  const primaryColor = company?.couleur_principale || '#10b981';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '260px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'none',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
        className="sidebar-desktop"
      >
        {/* Company Header in Sidebar */}
        <div style={{ padding: '1.15rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: `0 3px 10px ${primaryColor}44`,
              }}
            >
              {company?.logo ? (
                <img src={company.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={18} color="white" />
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: '0.92rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {company?.nom || 'Mon Entreprise'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {company?.secteur || 'Entreprise'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px', width: 'fit-content' }}>
            <ShieldCheck size={11} />
            <span>Espace Isolé</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.58rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? `${primaryColor}22` : 'transparent',
                  border: isActive ? `1px solid ${primaryColor}55` : '1px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ color: isActive ? primaryColor : 'inherit' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.nom}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#fb7185',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Topbar */}
        <header
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="mobile-topbar"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {company?.logo ? (
                <img src={company.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={16} color="white" />
              )}
            </div>
            <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>
              {company?.nom || 'Relancio'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'white',
                padding: '0.4rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              aria-label="Menu navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div
            style={{
              position: 'fixed',
              top: '56px',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(11, 15, 25, 0.98)',
              backdropFilter: 'blur(20px)',
              padding: '1.25rem',
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    background: isActive ? `${primaryColor}22` : 'transparent',
                    border: isActive ? `1px solid ${primaryColor}55` : '1px solid var(--border-subtle)',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ color: isActive ? primaryColor : 'inherit' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                handleLogout();
              }}
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#fb7185',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Se déconnecter</span>
            </button>
          </div>
        )}

        {/* Sub-route view */}
        <main style={{ flex: 1, padding: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
          <Outlet key={`${company?.id || 'none'}-${user?.id || 'none'}`} />
        </main>
      </div>

      {/* Desktop style helper */}
      <style>{`
        @media (min-width: 900px) {
          .sidebar-desktop {
            display: flex !important;
          }
          .mobile-topbar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
