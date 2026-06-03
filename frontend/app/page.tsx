import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { InfoSection } from "@/components/landing/InfoSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TechStack } from "@/components/landing/TechStack";
import { BackedBySection } from "@/components/landing/BackedBySection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      {/* Hero — full screen */}
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <HeroSection />
      </div>

      {/* Sections */}
      <InfoSection />
      <HowItWorks />
      <TechStack />
      <BackedBySection />
      <UseCasesSection />
      <FAQ />
      <Footer />
    </div>
  );
}
