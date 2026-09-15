import React, { useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCompanyCustomizer, BRAND_PRESETS } from '../context/CompanyCustomizerContext';
import {
  Upload,
  Trash2,
  Eye,
  Sliders,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Lock,
  Zap,
} from 'lucide-react';
import type { SectorType } from '../types';

export const CustomizationStudio: React.FC = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    company,
    activeDemand,
    showComparison,
    setShowComparison,
    updateCompany,
    applyPreset,
    handleLogoUpload,
    removeLogo,
  } = useCompanyCustomizer();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleLogoUpload(e.target.files[0]);
    }
  };

  const presetColors = [
    '#10b981', // Emerald
    '#0ea5e9', // Sky Blue
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#14b8a6', // Teal
    '#e11d48', // Crimson
  ];

  return (
    <section id="personnalisation" className="section bg-grid-pattern">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="badge-pill" style={{ marginBottom: '0.85rem' }}>
            <Sliders size={15} />
            <span>{t.customization.tag}</span>
          </div>
          <h2 className="section-title">
            {t.customization.title}
          </h2>
          <p className="section-subtitle">
            {t.customization.subtitle}
          </p>
        </div>

        {/* Quick Presets Bar */}
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="var(--primary)" />
            {t.customization.presetsTitle}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {BRAND_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                style={{
                  background: company.id === preset.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: company.id === preset.id ? '#0b0f19' : 'var(--text-primary)',
                  border: company.id === preset.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: company.id === preset.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Grid (Left: Configurator, Right: Phone Preview) */}
        <div className="customizer-studio-grid">
          {/* Left Panel: Personalization Controls */}
          <div className="customizer-editor-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="var(--primary)" />
                {t.customization.liveDemoTitle}
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                Temps réel
              </span>
            </div>

            {/* 1. Logo Management Box */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}
            >
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.75rem' }}>
                Logo de votre entreprise
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                {/* Logo Preview Box */}
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '16px',
                    backgroundColor: company.primaryColor,
                    border: '2px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    flexShrink: 0,
                  }}
                >
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt="Logo preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Building size={32} color="white" />
                  )}
                </div>

                {/* Upload & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      <span>{company.logoUrl ? t.customization.replaceLogo : t.customization.uploadLogo}</span>
                    </button>

                    {company.logoUrl && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={removeLogo}
                        style={{ color: '#fb7185', borderColor: 'rgba(244,63,94,0.3)' }}
                      >
                        <Trash2 size={14} />
                        <span>{t.customization.deleteLogo}</span>
                      </button>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Formats supportés : PNG, JPG, SVG, WebP. Fichiers légers recommandés.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Business Name & Sector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  {t.customization.companyNameLabel}
                </label>
                <input
                  type="text"
                  value={company.name}
                  onChange={e => updateCompany({ name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.9rem',
                    color: 'white',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                  placeholder="Ex: Pressing Royal Clean"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  {t.customization.sectorLabel}
                </label>
                <select
                  value={company.sector}
                  onChange={e => updateCompany({ sector: e.target.value as SectorType })}
                  style={{
                    width: '100%',
                    background: '#111827',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.9rem',
                    color: 'white',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                >
                  <option value="pressing">Pressing & Blanchisserie</option>
                  <option value="ecole">École & Éducation</option>
                  <option value="garage">Garage & Auto</option>
                  <option value="salon">Salon de coiffure & Beauté</option>
                  <option value="commerce">Boutique & Commerce</option>
                  <option value="artisan">Artisan & BTP</option>
                  <option value="services">Entreprise de services & Agence</option>
                  <option value="autre">Autre profession</option>
                </select>
              </div>
            </div>

            {/* 3. Colors selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                {t.customization.primaryColorLabel}
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                {presetColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateCompany({ primaryColor: color })}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: company.primaryColor === color ? '3px solid white' : '2px solid transparent',
                      cursor: 'pointer',
                      transform: company.primaryColor === color ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      boxShadow: company.primaryColor === color ? `0 0 12px ${color}` : 'none',
                    }}
                  />
                ))}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
                  <input
                    type="color"
                    value={company.primaryColor}
                    onChange={e => updateCompany({ primaryColor: e.target.value })}
                    style={{
                      width: '34px',
                      height: '34px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: 'transparent',
                    }}
                    title="Choisir une couleur sur-mesure"
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {company.primaryColor}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Phone & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  {t.customization.phoneLabel}
                </label>
                <input
                  type="text"
                  value={company.phone}
                  onChange={e => updateCompany({ phone: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.9rem',
                    color: 'white',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  {t.customization.emailLabel}
                </label>
                <input
                  type="text"
                  value={company.email}
                  onChange={e => updateCompany({ email: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.9rem',
                    color: 'white',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Comparison Toggle Button */}
            <div
              style={{
                marginTop: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-white)' }}>
                  {t.customization.beforeAfterToggle}
                </span>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${showComparison ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowComparison(!showComparison)}
              >
                {showComparison ? 'Vue Personnalisée' : 'Comparer Sans Branding'}
              </button>
            </div>
          </div>

          {/* Right Panel: Live Mobile Mockup (Client Payment Link View) */}
          <div className="customizer-preview-panel">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {t.customization.previewNote}
              </span>
            </div>

            {/* Smartphone frame */}
            <div className="phone-mockup">
              <div className="phone-screen">
                {/* Phone Speaker Notch Bar */}
                <div
                  style={{
                    background: '#0f172a',
                    padding: '0.4rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  <span>9:41</span>
                  <div style={{ width: '60px', height: '4px', background: '#334155', borderRadius: '4px' }} />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Branded Header of the Payment Page */}
                <div
                  style={{
                    background: showComparison
                      ? '#64748b'
                      : `linear-gradient(135deg, ${company.primaryColor} 0%, ${company.secondaryColor || company.primaryColor} 100%)`,
                    padding: '1.5rem 1.25rem',
                    color: '#ffffff',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Company Logo in Preview */}
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: '#ffffff',
                      margin: '0 auto 0.75rem auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                      overflow: 'hidden',
                    }}
                  >
                    {!showComparison && company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt="Company Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Building size={28} color="#0f172a" />
                    )}
                  </div>

                  {/* Company Name */}
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '0.2rem' }}>
                    {showComparison ? 'Entreprise Partenaire' : company.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, letterSpacing: '0.5px' }}>
                    DEMANDE OFFICIELLE DE RÈGLEMENT
                  </div>
                </div>

                {/* Payment Demand Body */}
                <div style={{ padding: '1.25rem', background: '#f8fafc', color: '#0f172a' }}>
                  {/* Amount Pill */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      marginBottom: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                      Montant net à régler
                    </span>
                    <div
                      style={{
                        fontSize: '1.9rem',
                        fontWeight: 900,
                        color: showComparison ? '#334155' : company.primaryColor,
                        letterSpacing: '-0.5px',
                        margin: '0.35rem 0',
                      }}
                    >
                      {activeDemand.amount.toLocaleString()} {activeDemand.currency}
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        color: '#d97706',
                        background: '#fef3c7',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        fontWeight: 600,
                      }}
                    >
                      {activeDemand.dueDate}
                    </div>
                  </div>

                  {/* Invoice / Service Info Details */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ marginBottom: '0.6rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Destinataire de la créance :</span>
                      <strong style={{ color: '#0f172a' }}>{activeDemand.clientName}</strong> ({activeDemand.clientPhone})
                    </div>
                    <div style={{ marginBottom: '0.6rem' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Motif de la prestation :</span>
                      <strong style={{ color: '#0f172a' }}>{activeDemand.motif}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Détail :</span>
                      <span style={{ color: '#475569' }}>{activeDemand.details}</span>
                    </div>
                  </div>

                  {/* Contact Useful Info */}
                  <div
                    style={{
                      background: '#f1f5f9',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.75rem',
                      color: '#475569',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={12} color="#64748b" />
                      <span>{company.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={12} color="#64748b" />
                      <span>{company.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={12} color="#64748b" />
                      <span>{company.city}</span>
                    </div>
                  </div>

                  {/* Simulated Action Button */}
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      background: showComparison ? '#334155' : company.primaryColor,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.9rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Lock size={16} />
                    <span>Régler en ligne en toute sécurité</span>
                  </button>

                  {/* Security Footer inside phone */}
                  <div style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.68rem', color: '#94a3b8' }}>
                    <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
                    Paiement sécurisé crypté 256-bit • Relancio FinTech
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
