import React, { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  Wallet,
  Play,
  Pause,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlowStep {
  id: number;
  label: string;
  shortTag: string;
  icon: React.ReactNode;
  actor: string;
  accentColor: string;
  title: string;
  description: string;
  stateBadge: string;
}

export const HeroInteractiveFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const steps: FlowStep[] = [
    {
      id: 1,
      label: "1. Créance due",
      shortTag: "Dette client",
      icon: <FileText size={18} />,
      actor: "Client débiteur",
      accentColor: "#f43f5e",
      title: "Client doit de l'argent",
      description: "Facture impayée de 75 000 FCFA pour une prestation réalisée il y a 14 jours.",
      stateBadge: "En retard (14 jours)",
    },
    {
      id: 2,
      label: "2. Création demande",
      shortTag: "Relancio",
      icon: <Send size={18} />,
      actor: "Plateforme Relancio",
      accentColor: "#0ea5e9",
      title: "Relancio crée une demande",
      description: "Génération automatique d'un lien sécurisé et chiffré aux couleurs de votre entreprise.",
      stateBadge: "Lien de paiement actif",
    },
    {
      id: 3,
      label: "3. Relance intelligente",
      shortTag: "WhatsApp & SMS",
      icon: <MessageCircle size={18} />,
      actor: "Système de notification",
      accentColor: "#8b5cf6",
      title: "Relancio relance le client",
      description: "Message courtois et professionnel transmis directement sur le WhatsApp du client.",
      stateBadge: "Relance #1 envoyée",
    },
    {
      id: 4,
      label: "4. Réception du lien",
      shortTag: "Expérience client",
      icon: <Smartphone size={18} />,
      actor: "Sur le mobile du client",
      accentColor: "#eab308",
      title: "Client reçoit un lien de paiement",
      description: "Le client ouvre une page épurée et rassurante aux couleurs de votre marque.",
      stateBadge: "Lien ouvert à l'instant",
    },
    {
      id: 5,
      label: "5. Règlement",
      shortTag: "Paiement sécurisé",
      icon: <CheckCircle2 size={18} />,
      actor: "Passerelle de paiement",
      accentColor: "#06b6d4",
      title: "Paiement effectué",
      description: "Validation instantanée via Mobile Money (Orange, Wave, MTN) ou Carte bancaire.",
      stateBadge: "Transaction validée",
    },
    {
      id: 6,
      label: "6. Argent encaissé",
      shortTag: "Trésorerie disponible",
      icon: <Wallet size={18} />,
      actor: "Votre compte bancaire",
      accentColor: "#10b981",
      title: "Argent encaissé & Créance soldée",
      description: "+75 000 FCFA crédités dans votre caisse. Le tableau de bord se met à jour en temps réel !",
      stateBadge: "Soldé à 100%",
    },
  ];

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep(prev => {
        const next = prev === 6 ? 1 : prev + 1;
        if (next === 6) {
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore if confetti fails
          }
        }
        return next;
      });
    }, 3600);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = steps.find(s => s.id === activeStep) || steps[0];

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
    if (stepId === 6) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  return (
    <div className="hero-flow-card">
      {/* Visual Top Bar */}
      <div className="hero-flow-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? 'var(--primary)' : '#94a3b8',
              boxShadow: isPlaying ? '0 0 10px var(--primary)' : 'none',
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)' }}>
            Flux de transformation en direct
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.75rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? (
            <>
              <Pause size={12} /> Pause défilement
            </>
          ) : (
            <>
              <Play size={12} /> Reprendre lecture
            </>
          )}
        </button>
      </div>

      {/* Interactive Step Buttons */}
      <div className="flow-step-badges">
        {steps.map(step => (
          <button
            key={step.id}
            type="button"
            className={`flow-step-btn ${activeStep === step.id ? 'active' : ''}`}
            onClick={() => handleStepClick(step.id)}
          >
            <span>{step.icon}</span>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      {/* Main Dynamic Stage Card */}
      <div className="flow-stage-screen">
        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: current.accentColor,
            filter: 'blur(50px)',
            opacity: 0.18,
            pointerEvents: 'none',
          }}
        />

        {/* Header of Stage */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: current.accentColor,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {current.icon} {current.actor}
          </span>
          <span
            style={{
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: `${current.accentColor}22`,
              color: current.accentColor,
              border: `1px solid ${current.accentColor}44`,
            }}
          >
            {current.stateBadge}
          </span>
        </div>

        {/* Dynamic Content Per Step */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h4
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-white)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {current.title}
          </h4>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {current.description}
          </p>

          {/* Interactive Simulation Graphic for the step */}
          <div
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {activeStep === 1 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <ShieldAlert color="#f43f5e" size={20} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Créance #CR-2026-77</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Client : M. Kouassi Jean</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f43f5e' }}>75 000 FCFA</div>
                  <div style={{ fontSize: '0.72rem', color: '#f87171' }}>Risque d'impayé</div>
                </div>
              </>
            )}

            {activeStep === 2 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Send color="#0ea5e9" size={20} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Lien court généré</div>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace' }}>pay.relancio.com/v/kr92</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', background: 'rgba(14, 165, 233, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                  Généré en 0.2s
                </span>
              </>
            )}

            {activeStep === 3 && (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <MessageCircle color="#25D366" size={16} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#25D366' }}>Aperçu message WhatsApp automatisé</span>
                </div>
                <div style={{ fontSize: '0.82rem', background: '#075E54', color: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '8px', lineHeight: 1.4 }}>
                  "Bonjour M. Kouassi, pour faire suite à votre passage, voici votre lien sécurisé pour régler vos 75 000 FCFA en 1 clic : pay.relancio.com/v/kr92. Merci pour votre fidélité !"
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Smartphone color="#eab308" size={20} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Page personnalisée du client</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Branding vérifié par votre logo</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>Prêt au règlement</span>
              </>
            )}

            {activeStep === 5 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 color="#06b6d4" size={22} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Wave / Orange / Carte</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Code d'autorisation #TX-99812</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#22d3ee', fontWeight: 700 }}>Succès immédiat</span>
              </>
            )}

            {activeStep === 6 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Wallet color="#10b981" size={22} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>+75 000 FCFA ENCAISSÉS</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Statut : Soldé • Commission Relancio prélevée</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
                  <TrendingUp size={16} /> Solde disponible
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progression Dots & Next Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1.25rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {steps.map(step => (
            <div
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              style={{
                width: activeStep === step.id ? '22px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: activeStep === step.id ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const next = activeStep === 6 ? 1 : activeStep + 1;
            handleStepClick(next);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-white)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>Étape suivante</span>
          <ArrowRight size={14} color="var(--primary)" />
        </button>
      </div>
    </div>
  );
};
