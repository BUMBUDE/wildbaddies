import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import VideoPage from "./pages/VideoPage.tsx";
import UploadPage from "./pages/UploadPage.tsx";
import CategoriesPage from "./pages/CategoriesPage.tsx";
import CategoryVideosPage from "./pages/CategoryVideosPage.tsx";
import AgeGate from "./components/AgeGate.tsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import DmcaPage from "./pages/DmcaPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import Compliance2257Page from "./pages/Compliance2257Page";
import JuicyPopunder from "./components/JuicyPopunder.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import { AuthProvider } from "./context/AuthContext";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AgeGate />
        <BrowserRouter>
        <JuicyPopunder />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/video/:slug" element={<VideoPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<CategoryVideosPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/dmca" element={<DmcaPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/2257" element={<Compliance2257Page />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
