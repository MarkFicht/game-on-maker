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
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isReady, setIsReady] = useState(false);

  // Initialize services and wait for fonts
  useEffect(() => {
    const init = async () => {
      // Wait for fonts to load
      await document.fonts.ready;
      
      // Small delay to ensure CSS is applied
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Initialize services
      await getAnalytics().initialize();
      await getBillingService().initialize();
      
      setIsReady(true);
    };
    init();
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
