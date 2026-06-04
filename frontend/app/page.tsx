import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { InfoSection } from "@/components/landing/InfoSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TechStack } from "@/components/landing/TechStack";
import { BackedBySection } from "@/components/landing/BackedBySection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      <div className="relative flex flex-col">
        <Navbar />
        <HeroSection />
      </div>
      <InfoSection />
      <HowItWorks />
      <TechStack />
      <BackedBySection />
      <UseCasesSection />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
