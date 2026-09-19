import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../i18n/LanguageContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { t, locale, isRtl } = useLanguage();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [sector, setSector] = useState('pressing');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [amount, setAmount] = useState('50000');
  const [motif, setMotif] = useState('');

  const [linkToken] = useState('kr92a');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Completed
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
      setTimeout(() => {
        onClose();
        setStep(1);
      }, 2500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            ...(isRtl ? { left: '1.25rem' } : { right: '1.25rem' }),
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="badge-pill" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={14} />
            <span>
              {t.auth.onboardingStep} {step} {t.auth.onboardingOf} 3 • {t.auth.expressConfig}
            </span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
            {step === 1 && t.auth.step1Title}
            {step === 2 && t.auth.step2Title}
            {step === 3 && t.auth.step3Title}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {step === 1 && t.auth.step1Subtitle}
            {step === 2 && t.auth.step2Subtitle}
            {step === 3 && t.auth.step3Subtitle}
          </p>
        </div>

        {/* Form Steps */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                {t.auth.companyName}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: مغسلة السلام النموذجية، كراج الصيانة السريعة...' : 'Ex: Pressing Moderne Dakar, Garage Rapide...'}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                {t.auth.sector}
              </label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="pressing">{t.auth.sectors.pressing}</option>
                <option value="ecole">{t.auth.sectors.ecole}</option>
                <option value="garage">{t.auth.sectors.garage}</option>
                <option value="salon">{t.auth.sectors.salon}</option>
                <option value="commerce">{t.auth.sectors.commerce}</option>
                <option value="artisan">{t.auth.sectors.artisan}</option>
                <option value="services">{t.auth.sectors.services}</option>
                <option value="autre">{t.auth.sectors.autre}</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                {t.clients.name}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: السيد خالد، شركة الأمل...' : 'Ex: M. Diallo, Entreprise SOGEP...'}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  {t.common.phone}
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="+225 07..."
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    direction: 'ltr',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  {t.common.amount} ({t.common.currency})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    direction: 'ltr',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                {t.creances.motif}
              </label>
              <input
                type="text"
                value={motif}
                onChange={e => setMotif(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: متبقي فاتورة الملابس، رسوم تدريب، صيانة...' : 'Ex: Solde linge pressing, Frais scolarité, Réparation...'}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                {t.demandes.createdModalSubtitle}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', direction: 'ltr' }}>
                pay.relancio.com/l/{linkToken}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'white', marginTop: '0.5rem' }}>
                {locale === 'ar'
                  ? `للعميل ${clientName || 'السيد كواسي'} • ${parseInt(amount || '50000').toLocaleString('ar-EG')} ${t.common.currency}`
                  : `Pour ${clientName || 'M. Kouassi'} • ${parseInt(amount || '50000').toLocaleString('fr-FR')} ${t.common.currency}`}
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.demandes.directLinkNotice}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          {step > 1 ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setStep(step - 1)}
            >
              {t.auth.previous}
            </button>
          ) : <div />}

          <button
            type="button"
            className="btn btn-primary btn-glow"
            onClick={handleNext}
          >
            <span>{step === 3 ? t.auth.finishOnboarding : t.auth.next}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
