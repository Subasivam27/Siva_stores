import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Monitor, ShieldCheck, User, Search, ShoppingCart, Truck, Store, CheckCircle, AlertCircle, LogIn, LogOut, Key } from 'lucide-react';

export default function Navbar({ onOpenCart, onOpenOrders, onOpenAuth }) {
  const {
    activePortal,
    setActivePortal,
    currentUser,
    logout,
    isAdmin,
    isCashier,
    cart,
    searchQuery,
    setSearchQuery,
    storeSettings,
    notification
  } = useStore();

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Toast Notification */}
      {notification && (
        <div className={`py-2 px-4 text-center font-medium text-xs flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200 ${
          notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-emerald-400 uppercase tracking-widest">{storeSettings.platformName}</span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            {storeSettings.storeName} ({storeSettings.location})
          </span>
          <span className="hidden sm:inline-block bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/30">
            Open • {storeSettings.openingTime} - {storeSettings.closingTime}
          </span>
        </div>

        {/* User Account / Login Bar */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs hidden sm:inline">Signed in as:</span>
              <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <span className="text-emerald-400 font-bold text-xs">{currentUser.name}</span>
                <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded font-mono">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="text-xs text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/80 hover:bg-emerald-900 px-3 py-1 rounded-lg border border-emerald-500/40 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePortal('customer')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-emerald-600/30">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 leading-tight flex items-center gap-1.5">
              SIVA <span className="text-emerald-600">DEPARTMENT STORE</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Central Shared Inventory Platform</p>
          </div>
        </div>

        {/* Search Bar (When in Customer mode) */}
        {activePortal === 'customer' && (
          <div className="flex-1 max-w-md relative hidden md:block">
            <input
              type="text"
              placeholder="Search products by Name, Barcode, SKU or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </div>
        )}

        {/* Portal View Switcher Buttons (Strictly Restricted based on Role) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActivePortal('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePortal === 'customer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Online Shop</span>
          </button>

          {/* POS Terminal Access (Visible to Cashiers, Managers & Admin) */}
          {isCashier && (
            <button
              onClick={() => setActivePortal('pos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePortal === 'pos'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>POS Billing</span>
            </button>
          )}

          {/* Admin Control Panel (STRICTLY DISPLAYED ONLY TO ADMIN) */}
          {isAdmin && (
            <button
              onClick={() => setActivePortal('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePortal === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin Control</span>
            </button>
          )}
        </div>

        {/* Actions (My Orders & Cart Counter) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenOrders}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-emerald-600 font-semibold bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-2xl border border-slate-200 transition-all"
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">My Orders</span>
          </button>

          {activePortal === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-2xl font-medium transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
