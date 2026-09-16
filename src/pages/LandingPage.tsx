import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProblemSection } from '../components/ProblemSection';
import { SolutionSection } from '../components/SolutionSection';
import { MultiSectorSection } from '../components/MultiSectorSection';
import { CustomizationStudio } from '../components/CustomizationStudio';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { BusinessModelSection } from '../components/BusinessModelSection';
import { DashboardMockupSection } from '../components/DashboardMockupSection';
import { TestimonialsFAQ } from '../components/TestimonialsFAQ';
import { CTASection } from '../components/CTASection';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const scrollToCustomizer = () => {
    const el = document.getElementById('personnalisation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenOnboarding = () => {
    navigate('/inscription');
  };

  const handleOpenLogin = () => {
    navigate('/connexion');
  };

  return (
    <div className="relancio-app-root">
      {/* Sticky Header */}
      <Navbar
        onOpenOnboarding={handleOpenOnboarding}
        onOpenLogin={handleOpenLogin}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section */}
        <Hero
          onOpenOnboarding={handleOpenOnboarding}
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
          onOpenOnboarding={handleOpenOnboarding}
        />

        {/* 8. Dashboard Mockup */}
        <DashboardMockupSection />

        {/* 9. FAQ */}
        <TestimonialsFAQ />

        {/* 10. Final Call to Action */}
        <CTASection
          onOpenOnboarding={handleOpenOnboarding}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
