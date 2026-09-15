import { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { CompanyCustomizerProvider } from './context/CompanyCustomizerContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { MultiSectorSection } from './components/MultiSectorSection';
import { CustomizationStudio } from './components/CustomizationStudio';
import { HowItWorksSection } from './components/HowItWorksSection';
import { BusinessModelSection } from './components/BusinessModelSection';
import { DashboardMockupSection } from './components/DashboardMockupSection';
import { TestimonialsFAQ } from './components/TestimonialsFAQ';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { OnboardingModal } from './components/OnboardingModal';
import { LoginModal } from './components/LoginModal';

function RelancioApp() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const scrollToCustomizer = () => {
    const el = document.getElementById('personnalisation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relancio-app-root">
      {/* Sticky Header */}
      <Navbar
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section */}
        <Hero
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onExploreDemo={scrollToCustomizer}
        />

        {/* 2. Problem Section */}
        <ProblemSection />

        {/* 3. Solution Section */}
        <SolutionSection />

        {/* 4. Multi-Sectors Section */}
        <MultiSectorSection />

        {/* 5. Customization Studio (Votre entreprise. Votre identité.) */}
        <CustomizationStudio />

        {/* 6. How It Works Timeline */}
        <HowItWorksSection />

        {/* 7. Economic Model (Pas d'abonnement obligatoire) */}
        <BusinessModelSection
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        {/* 8. Dashboard Mockup */}
        <DashboardMockupSection />

        {/* 9. FAQ */}
        <TestimonialsFAQ />

        {/* 10. Final Call to Action */}
        <CTASection
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          const dash = document.getElementById('dashboard');
          if (dash) dash.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CompanyCustomizerProvider>
        <RelancioApp />
      </CompanyCustomizerProvider>
    </LanguageProvider>
  );
}
