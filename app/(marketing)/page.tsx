import { Header } from "./_components/header";
import { HeroSection } from "./_components/hero-section";
import { StatsSection } from "./_components/stats-section";
import { FeaturesSection } from "./_components/features-section";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { CTASection } from "./_components/cta-section";
import { Footer } from "./_components/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
