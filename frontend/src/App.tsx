import { useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./lib/chain";

// Landing sections
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { InfoSection } from "./components/InfoSection";
import { BackedBySection } from "./components/BackedBySection";
import { UseCasesSection } from "./components/UseCasesSection";

// App pages
import { AppShell } from "./components/app/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateGroupPage } from "./pages/CreateGroupPage";
import { GroupDetailPage } from "./pages/GroupDetailPage";

const queryClient = new QueryClient();

function Router() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Landing page
  if (!hash || hash === "#") {
    return (
      <div className="flex flex-col bg-[#F5F5F5]">
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

  // Group detail: #group/0x...
  if (hash.startsWith("#group/")) {
    const addr = hash.replace("#group/", "") as `0x${string}`;
    return (
      <AppShell>
        <GroupDetailPage address={addr} />
      </AppShell>
    );
  }

  // App pages
  const appRoutes: Record<string, JSX.Element> = {
    "#app": <DashboardPage />,
    "#app/groups": <DashboardPage />,
    "#create": <CreateGroupPage />,
    "#app/reputation": <DashboardPage />,
  };

  const page = appRoutes[hash] ?? <DashboardPage />;

  return <AppShell>{page}</AppShell>;
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
