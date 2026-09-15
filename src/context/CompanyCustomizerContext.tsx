import React, { createContext, useContext, useState } from 'react';
import type { CompanyProfile, PaymentDemandPreview, SectorType } from '../types';

export interface BrandPreset {
  id: string;
  name: string;
  sector: SectorType;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  phone: string;
  email: string;
  city: string;
  currency: 'FCFA' | 'EUR' | 'USD' | 'MAD';
  brandSlogan: string;
  sampleDemand: {
    clientName: string;
    clientPhone: string;
    amount: number;
    motif: string;
    details: string;
  };
}

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'pressing-elite',
    name: 'Pressing Royal Clean',
    sector: 'pressing',
    primaryColor: '#0ea5e9', // Vibrant Sky Blue
    secondaryColor: '#0284c7',
    logoUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230284c7'/><path d='M30 70 C30 50, 50 35, 50 25 C50 35, 70 50, 70 70 C70 81, 61 90, 50 90 C39 90, 30 81, 30 70 Z' fill='white'/><circle cx='50' cy='62' r='8' fill='%2338bdf8'/></svg>",
    phone: '+225 07 88 99 12 34',
    email: 'contact@royalclean.ci',
    city: 'Abidjan - Cocody',
    currency: 'FCFA',
    brandSlogan: 'Pressing Haute Qualité & Blanchisserie Express',
    sampleDemand: {
      clientName: 'M. Kouassi Jean',
      clientPhone: '+225 05 44 22 11 00',
      amount: 45000,
      motif: 'Nettoyage 4 costumes 3 pièces + 6 chemises amidonnées',
      details: 'Livraison express à domicile effectuée - Bon de dépôt #RC-892',
    },
  },
  {
    id: 'ecole-horizon',
    name: 'Groupe Scolaire Les Étoiles',
    sector: 'ecole',
    primaryColor: '#10b981', // Emerald Green
    secondaryColor: '#059669',
    logoUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23059669'/><path d='M50 20 L80 35 L50 50 L20 35 Z' fill='white'/><path d='M30 45 L30 65 C30 72, 50 80, 50 80 C50 80, 70 72, 70 65 L70 45' stroke='white' stroke-width='6' fill='none'/></svg>",
    phone: '+221 33 824 55 66',
    email: 'comptabilite@etoiles-ecole.sn',
    city: 'Dakar - Almadies',
    currency: 'FCFA',
    brandSlogan: 'Excellence académique & Éducation d\'avenir',
    sampleDemand: {
      clientName: 'Mme Fatou Diallo',
      clientPhone: '+221 77 654 32 10',
      amount: 150000,
      motif: 'Frais de scolarité Trimestre 2 - Classe de 3ème B',
      details: 'Matricule élève: ET-2026-441 - Inclut cantine et transport',
    },
  },
  {
    id: 'garage-auto',
    name: 'Garage Turbo Auto Services',
    sector: 'garage',
    primaryColor: '#f59e0b', // Amber
    secondaryColor: '#d97706',
    logoUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23d97706'/><path d='M25 65 L35 35 L65 35 L75 65 Z' fill='none' stroke='white' stroke-width='7' stroke-linejoin='round'/><circle cx='38' cy='65' r='10' fill='white'/><circle cx='62' cy='65' r='10' fill='white'/></svg>",
    phone: '+225 01 02 03 04 05',
    email: 'atelier@turbo-auto.ci',
    city: 'Abidjan - Treichville',
    currency: 'FCFA',
    brandSlogan: 'Mécanique de précision & Diagnostic électronique',
    sampleDemand: {
      clientName: 'Entreprise SOGETRA SA',
      clientPhone: '+225 07 11 22 33 44',
      amount: 285000,
      motif: 'Révision générale, kit distribution & plaquettes de frein',
      details: 'Véhicule Toyota Hilux 4x4 Immatriculation 4519-GH-01',
    },
  },
  {
    id: 'salon-beaute',
    name: 'Aura Beauté & Spa Lounge',
    sector: 'salon',
    primaryColor: '#ec4899', // Modern Pink / Magenta
    secondaryColor: '#db2777',
    logoUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23db2777'/><circle cx='50' cy='50' r='28' stroke='white' stroke-width='6' fill='none'/><path d='M50 30 C50 45, 65 50, 65 65 C65 73, 58 78, 50 78 C42 78, 35 73, 35 65 C35 50, 50 45, 50 30 Z' fill='white'/></svg>",
    phone: '+212 522 99 88 77',
    email: 'booking@aurabeaute.ma',
    city: 'Casablanca - Gauthier',
    currency: 'MAD',
    brandSlogan: 'Soins esthétiques exclusifs & Coiffure professionnelle',
    sampleDemand: {
      clientName: 'Mlle Salma Bennani',
      clientPhone: '+212 661 22 33 44',
      amount: 1800,
      motif: 'Forfait Mariage Deluxe & Soin visage revitalisant',
      details: 'Prestation réalisée le 12 Septembre - Reste à solder',
    },
  },
  {
    id: 'commerce-boutique',
    name: 'Khadija Mode & Tissus Chic',
    sector: 'commerce',
    primaryColor: '#8b5cf6', // Violet / Purple
    secondaryColor: '#7c3aed',
    logoUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%237c3aed'/><path d='M30 40 L70 40 L65 75 L35 75 Z' fill='white'/><path d='M40 40 C40 28, 60 28, 60 40' stroke='white' stroke-width='6' fill='none'/></svg>",
    phone: '+223 70 80 90 10',
    email: 'boutique@khadijamode.ml',
    city: 'Bamako - Hamdallaye ACI 2000',
    currency: 'FCFA',
    brandSlogan: 'Bazin riche, prêt-à-porter & accessoires de luxe',
    sampleDemand: {
      clientName: 'Mme Awa Traoré',
      clientPhone: '+223 66 55 44 33',
      amount: 95000,
      motif: 'Solde 3 pièces Bazin Gagni VIP brodé sur mesure',
      details: 'Commande #BAM-402 - Acompte de 50 000 FCFA déjà perçu',
    },
  },
];

interface CompanyCustomizerContextType {
  company: CompanyProfile;
  activeDemand: PaymentDemandPreview;
  showComparison: boolean;
  setShowComparison: (show: boolean) => void;
  updateCompany: (updates: Partial<CompanyProfile>) => void;
  applyPreset: (presetId: string) => void;
  handleLogoUpload: (file: File) => Promise<void>;
  removeLogo: () => void;
  updateDemand: (updates: Partial<PaymentDemandPreview>) => void;
}

const CompanyCustomizerContext = createContext<CompanyCustomizerContextType | undefined>(undefined);

export const CompanyCustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyProfile>({
    id: BRAND_PRESETS[0].id,
    name: BRAND_PRESETS[0].name,
    sector: BRAND_PRESETS[0].sector,
    logoUrl: BRAND_PRESETS[0].logoUrl,
    primaryColor: BRAND_PRESETS[0].primaryColor,
    secondaryColor: BRAND_PRESETS[0].secondaryColor,
    phone: BRAND_PRESETS[0].phone,
    email: BRAND_PRESETS[0].email,
    city: BRAND_PRESETS[0].city,
    currency: BRAND_PRESETS[0].currency,
    brandSlogan: BRAND_PRESETS[0].brandSlogan,
  });

  const [activeDemand, setActiveDemand] = useState<PaymentDemandPreview>({
    id: 'dem-001',
    reference: 'REL-2026-894',
    clientName: BRAND_PRESETS[0].sampleDemand.clientName,
    clientPhone: BRAND_PRESETS[0].sampleDemand.clientPhone,
    amount: BRAND_PRESETS[0].sampleDemand.amount,
    currency: BRAND_PRESETS[0].currency,
    motif: BRAND_PRESETS[0].sampleDemand.motif,
    dueDate: 'Échu depuis 5 jours',
    details: BRAND_PRESETS[0].sampleDemand.details,
    status: 'pending',
    createdAt: '10 Septembre 2026',
  });

  const [showComparison, setShowComparison] = useState<boolean>(false);

  const updateCompany = (updates: Partial<CompanyProfile>) => {
    setCompany(prev => ({ ...prev, ...updates }));
  };

  const updateDemand = (updates: Partial<PaymentDemandPreview>) => {
    setActiveDemand(prev => ({ ...prev, ...updates }));
  };

  const applyPreset = (presetId: string) => {
    const preset = BRAND_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setCompany({
      id: preset.id,
      name: preset.name,
      sector: preset.sector,
      logoUrl: preset.logoUrl,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      phone: preset.phone,
      email: preset.email,
      city: preset.city,
      currency: preset.currency,
      brandSlogan: preset.brandSlogan,
    });

    setActiveDemand(prev => ({
      ...prev,
      clientName: preset.sampleDemand.clientName,
      clientPhone: preset.sampleDemand.clientPhone,
      amount: preset.sampleDemand.amount,
      currency: preset.currency,
      motif: preset.sampleDemand.motif,
      details: preset.sampleDemand.details,
    }));
  };

  const handleLogoUpload = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateCompany({ logoUrl: reader.result });
          resolve();
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const removeLogo = () => {
    updateCompany({ logoUrl: null });
  };

  return (
    <CompanyCustomizerContext.Provider
      value={{
        company,
        activeDemand,
        showComparison,
        setShowComparison,
        updateCompany,
        applyPreset,
        handleLogoUpload,
        removeLogo,
        updateDemand,
      }}
    >
      {children}
    </CompanyCustomizerContext.Provider>
  );
};

export const useCompanyCustomizer = () => {
  const context = useContext(CompanyCustomizerContext);
  if (!context) {
    throw new Error('useCompanyCustomizer must be used within CompanyCustomizerProvider');
  }
  return context;
};
