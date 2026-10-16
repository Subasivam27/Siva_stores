import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import CustomerStore from './components/CustomerStore';
import PosTerminal from './components/PosTerminal';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import OrderModal from './components/OrderModal';
import AuthModal from './components/AuthModal';
import { Store, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

function AppContent() {
  const { activePortal, storeSettings } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      {/* Navigation Header */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Portals */}
      <main className="flex-1">
        {activePortal === 'customer' && <CustomerStore />}
        {activePortal === 'pos' && <PosTerminal />}
        {activePortal === 'admin' && <AdminDashboard />}
      </main>

      {/* Cart, Orders, and Auth Modals */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <OrderModal isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Light Theme Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-8 px-4 mt-12 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              {storeSettings.storeName}
            </h4>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Unified Physical Department Store & Online E-commerce platform powered by ZYPHOR ZONE. Real-time central inventory synchronization.
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-slate-900 text-xs">Store Address</h5>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              {storeSettings.location}
            </p>
            <p className="text-[11px]">Owner: <span className="text-slate-900 font-bold">{storeSettings.ownerName}</span></p>
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-slate-900 text-xs">Helpline & GST</h5>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              +91 {storeSettings.phone}
            </p>
            <p className="text-[11px]">GSTIN: <span className="font-mono text-emerald-700 font-bold">{storeSettings.gstin}</span></p>
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-slate-900 text-xs">Platform Architecture</h5>
            <p className="text-[11px] text-slate-600">ZYPHOR ZONE Multi-Store Core</p>
            <p className="text-[11px] text-emerald-600 font-bold">100% Shared Central Inventory</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2 text-[11px] text-slate-400">
          <span>© 2026 ZYPHOR ZONE — Siva Department Store. All rights reserved.</span>
          <span className="flex items-center gap-1 font-medium">
            Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Somanahalli & Palacode
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
