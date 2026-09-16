import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { CompanyCustomizerProvider } from './context/CompanyCustomizerContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

// Entreprise Portal Pages
import { EntrepriseLayout } from './pages/entreprise/EntrepriseLayout';
import { EntrepriseDashboard } from './pages/entreprise/EntrepriseDashboard';
import { EntrepriseSettings } from './pages/entreprise/EntrepriseSettings';
import { ClientsPage } from './pages/entreprise/ClientsPage';
import { CreancesPage } from './pages/entreprise/CreancesPage';
import { PaiementsPage } from './pages/entreprise/PaiementsPage';
import { RelancesPage } from './pages/entreprise/RelancesPage';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CompanyCustomizerProvider>
            <Routes>
              {/* 1. Page d'accueil VALIDÉE et INCHANGÉE */}
              <Route path="/" element={<LandingPage />} />

              {/* 2. Inscription Entreprise */}
              <Route path="/inscription" element={<RegisterPage />} />

              {/* 3. Connexion Entreprise */}
              <Route path="/connexion" element={<LoginPage />} />

              {/* 4. Super Admin (Connexion & Dashboard) */}
              <Route path="/admin" element={<AdminPage />} />

              {/* 5. Espace Entreprise (Tenant Isolé) */}
              <Route path="/entreprise" element={<EntrepriseLayout />}>
                <Route index element={<EntrepriseDashboard />} />
                <Route path="parametres" element={<EntrepriseSettings />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="creances" element={<CreancesPage />} />
                <Route path="paiements" element={<PaiementsPage />} />
                <Route path="relances" element={<RelancesPage />} />
              </Route>

              {/* Redirection fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CompanyCustomizerProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
