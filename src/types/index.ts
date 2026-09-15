export type SectorType =
  | 'pressing'
  | 'ecole'
  | 'garage'
  | 'salon'
  | 'commerce'
  | 'artisan'
  | 'services'
  | 'autre';

export interface SectorItem {
  id: SectorType;
  title: string;
  icon: string;
  tagline: string;
  exampleDebt: string;
  typicalAmount: string;
  color: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  sector: SectorType;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  city: string;
  currency: 'FCFA' | 'EUR' | 'USD' | 'MAD';
  brandSlogan?: string;
}

export interface PaymentDemandPreview {
  id: string;
  reference: string;
  clientName: string;
  clientPhone: string;
  amount: number;
  currency: string;
  motif: string;
  dueDate: string;
  details: string;
  status: 'draft' | 'pending' | 'reminded' | 'paid';
  createdAt: string;
}

export interface DashboardMetric {
  title: string;
  value: string;
  changeText?: string;
  isPositive?: boolean;
  iconName: string;
  colorTheme: 'emerald' | 'amber' | 'indigo' | 'rose' | 'cyan';
}

export type SupportedLocale = 'fr' | 'en' | 'ar';
