import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, Sparkles, MapPin, Globe, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow-teal">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-display font-extrabold tracking-tight text-white">
                  TripWise
                </span>
                <span className="text-2xl font-display font-extrabold text-teal-400">
                  AI
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Empowering global travelers with verified real-world places, grounded Gemini AI trip planning, interactive routing, and precision travel budget calculations.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs text-teal-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini & Google Maps
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-teal-400 transition-colors">
                  Popular Destinations
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-teal-400 transition-colors">
                  Interactive Live Map
                </Link>
              </li>
              <li>
                <Link to="/nearby" className="hover:text-teal-400 transition-colors">
                  Nearby Attractions
                </Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-teal-400 transition-colors">
                  AI Trip Generator
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-teal-400 transition-colors">
                  AI Travel Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Management */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Trip Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/trips" className="hover:text-teal-400 transition-colors">
                  My Trips & Itineraries
                </Link>
              </li>
              <li>
                <Link to="/budget" className="hover:text-teal-400 transition-colors">
                  Budget Planner
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-teal-400 transition-colors">
                  Saved Destinations
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-teal-400 transition-colors">
                  Custom Collections
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-teal-400 transition-colors">
                  Traveler Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Company & Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/legal?tab=about" className="hover:text-teal-400 transition-colors">
                  About TripWise AI
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=contact" className="hover:text-teal-400 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=privacy" className="hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=terms" className="hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TripWise AI. Designed with precision for global explorers.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-400" /> Secure SSL Encryption
            </span>
            <span>REST API v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
