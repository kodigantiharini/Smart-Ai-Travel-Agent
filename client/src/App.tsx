import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/dashboard/Sidebar';
import { TopSearchBar } from './components/dashboard/TopSearchBar';
import { BottomNav } from './components/dashboard/BottomNav';
import { Footer } from './components/Footer';

// Animation & Onboarding
import { PageTransition } from './components/animation/PageTransition';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { CinematicIntro } from './components/cinematic/CinematicIntro';

// Application Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { MapPage } from './pages/MapPage';
import { PlaceDetailsPage } from './pages/PlaceDetailsPage';
import { NearbyPage } from './pages/NearbyPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { ItineraryPage } from './pages/ItineraryPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { SavedPlacesPage } from './pages/SavedPlacesPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { BudgetPlannerPage } from './pages/BudgetPlannerPage';
import { ExpenseTrackerPage } from './pages/ExpenseTrackerPage';
import { BookingsPage } from './pages/BookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LegalPage } from './pages/LegalPage';

// Animated Route Switcher
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 1. Home Dashboard */}
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />

        {/* 2. Explore Destinations */}
        <Route
          path="/explore"
          element={
            <PageTransition>
              <ExplorePage />
            </PageTransition>
          }
        />

        {/* 3. Interactive Map */}
        <Route
          path="/map"
          element={
            <PageTransition>
              <MapPage />
            </PageTransition>
          }
        />

        {/* 4. Place Details */}
        <Route
          path="/places/:placeId"
          element={
            <PageTransition>
              <PlaceDetailsPage />
            </PageTransition>
          }
        />

        {/* 5. Nearby Attractions */}
        <Route
          path="/nearby"
          element={
            <PageTransition>
              <NearbyPage />
            </PageTransition>
          }
        />

        {/* 6. AI Travel Assistant */}
        <Route
          path="/assistant"
          element={
            <PageTransition>
              <AiAssistantPage />
            </PageTransition>
          }
        />

        {/* 7. AI Trip Planner */}
        <Route
          path="/planner"
          element={
            <PageTransition>
              <TripPlannerPage />
            </PageTransition>
          }
        />
        <Route
          path="/trip-planner"
          element={
            <PageTransition>
              <TripPlannerPage />
            </PageTransition>
          }
        />

        {/* 8. Itinerary Details */}
        <Route
          path="/trips/:tripId/itinerary"
          element={
            <PageTransition>
              <ItineraryPage />
            </PageTransition>
          }
        />

        {/* 9. My Trips */}
        <Route
          path="/trips"
          element={
            <PageTransition>
              <MyTripsPage />
            </PageTransition>
          }
        />

        {/* 10. Bookings (Hotels, Flights, Transit) */}
        <Route
          path="/bookings"
          element={
            <PageTransition>
              <BookingsPage />
            </PageTransition>
          }
        />

        {/* 11. Saved Places */}
        <Route
          path="/saved"
          element={
            <PageTransition>
              <SavedPlacesPage />
            </PageTransition>
          }
        />

        {/* 12. Collections */}
        <Route
          path="/collections"
          element={
            <PageTransition>
              <CollectionsPage />
            </PageTransition>
          }
        />

        {/* 13. Budget Planner */}
        <Route
          path="/budget"
          element={
            <PageTransition>
              <BudgetPlannerPage />
            </PageTransition>
          }
        />

        {/* 14. Expense Tracker */}
        <Route
          path="/expenses"
          element={
            <PageTransition>
              <ExpenseTrackerPage />
            </PageTransition>
          }
        />

        {/* 15. User Profile */}
        <Route
          path="/profile"
          element={
            <PageTransition>
              <ProfilePage />
            </PageTransition>
          }
        />

        {/* 16. Settings */}
        <Route
          path="/settings"
          element={
            <PageTransition>
              <SettingsPage />
            </PageTransition>
          }
        />

        {/* 17. Login */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />

        {/* 18. Registration */}
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
          }
        />

        {/* 19. Forgot Password */}
        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPasswordPage />
            </PageTransition>
          }
        />

        {/* 20. Notifications */}
        <Route
          path="/notifications"
          element={
            <PageTransition>
              <NotificationsPage />
            </PageTransition>
          }
        />

        {/* 21. Legal & Policies */}
        <Route
          path="/legal"
          element={
            <PageTransition>
              <LegalPage />
            </PageTransition>
          }
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// Main App Layout with Persistent Desktop Sidebar and Top Search Bar
const MainAppContent: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const location = useLocation();

  // Auto-close mobile sidebar when navigating between routes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Auto-close mobile drawer when window resizes to desktop viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for replay requests from Settings or User
  useEffect(() => {
    const handleReplay = () => {
      setShowIntro(true);
    };
    window.addEventListener('tripwise:replay-intro', handleReplay);
    return () => window.removeEventListener('tripwise:replay-intro', handleReplay);
  }, []);

  return (
    <>
      {/* Optional Cinematic Intro on explicit replay */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <CinematicIntro
            onComplete={() => setShowIntro(false)}
            isReplay={true}
          />
        )}
      </AnimatePresence>

      {/* Optional First-Time Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Main App Container */}
      <div className="flex h-screen h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
        {/* Persistent Desktop Left Sidebar */}
        <div className="hidden lg:block shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileSidebarOpen(false)}
                aria-hidden="true"
              />
              <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
                <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Top Search Bar */}
          <TopSearchBar
            onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          />

          {/* Scrollable Main Application Routes Area with Safe Area Bottom Padding for Mobile Nav */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bottom-nav-safe lg:pb-0">
            <AnimatedRoutes />
            <Footer />
          </main>

          {/* Fixed Mobile Bottom Navigation Bar */}
          <BottomNav />
        </div>
      </div>
    </>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainAppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
