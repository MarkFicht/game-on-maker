import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnalytics } from "@/services/analytics";
import { getBillingService } from "@/services/billing";

// Pages
import Home from "./pages/Home";
import Decks from "./pages/Decks";
import Game from "./pages/Game";
import Paywall from "./pages/Paywall";
import PremiumSummary from "./pages/PremiumSummary";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isReady, setIsReady] = useState(false);

  // Initialize services and wait for fonts
  useEffect(() => {
    let objectUrl: string | null = null;
    let alive = true;

    const init = async () => {
      try {
        // Fetch background image as blob
        const url = new URL('@/game/bg.jpg', import.meta.url).href;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);

        // Create background div if it doesn't exist
        let bgDiv = document.getElementById('app-background');
        if (!bgDiv) {
          bgDiv = document.createElement('div');
          bgDiv.id = 'app-background';
          bgDiv.className = 'fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat';
          document.body.insertBefore(bgDiv, document.body.firstChild);
        }
        bgDiv.style.backgroundImage = `url('${objectUrl}')`;
      } catch (err) {
        console.error('Failed to load background:', err);
      }

      // Wait for fonts
      await document.fonts.ready;

      // Initialize services
      if (alive) {
        await getAnalytics().initialize();
        await getBillingService().initialize();
        setIsReady(true);
      }
    };

    init();

    // Cleanup: revoke ObjectURL
    return () => {
      alive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-display">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter basename={import.meta.env.PROD ? '/game-on-maker' : '/'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/game/:deckId" element={<Game />} />
            <Route path="/paywall" element={<Paywall />} />
            <Route path="/premium-summary" element={<PremiumSummary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
