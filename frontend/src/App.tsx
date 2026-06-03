import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { InfoSection } from "./components/InfoSection";
import { BackedBySection } from "./components/BackedBySection";
import { UseCasesSection } from "./components/UseCasesSection";

export default function App() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      {/* First section: Navbar + Hero (h-screen) */}
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <HeroSection />
      </div>

      <InfoSection />
      <BackedBySection />
      <UseCasesSection />
    </div>
  );
}
