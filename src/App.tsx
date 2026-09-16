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
import { PlaceholderModule } from './pages/entreprise/PlaceholderModule';

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
                <Route
                  path="clients"
                  element={
                    <PlaceholderModule
                      moduleName="Clients"
                      moduleIcon="👥"
                      moduleDescription="Gérez votre répertoire de clients, leurs coordonnées WhatsApp et leur historique de règlement."
                    />
                  }
                />
                <Route
                  path="creances"
                  element={
                    <PlaceholderModule
                      moduleName="Créances"
                      moduleIcon="📄"
                      moduleDescription="Enregistrez vos factures impayées, montants dus et motifs de prestations."
                    />
                  }
                />
                <Route
                  path="paiements"
                  element={
                    <PlaceholderModule
                      moduleName="Paiements"
                      moduleIcon="💳"
                      moduleDescription="Suivez les encaissements confirmés et les fonds crédités dans votre caisse."
                    />
                  }
                />
                <Route
                  path="relances"
                  element={
                    <PlaceholderModule
                      moduleName="Relances"
                      moduleIcon="🔔"
                      moduleDescription="Paramétrez vos messages de relance automatiques par WhatsApp et SMS."
                    />
                  }
                />
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
