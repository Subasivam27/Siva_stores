import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Star, Tag, Check, AlertTriangle, Plus, Search, ShieldCheck, Truck, RefreshCw, Barcode, Lock, FileCheck2, Award } from 'lucide-react';

export default function CustomerStore() {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    storeSettings
  } = useStore();

  const [scanBarcodeQuery, setScanBarcodeQuery] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const barcodeSearch = scanBarcodeQuery.trim();

    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchLower) ||
      p.brand.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower) ||
      p.barcode.includes(searchLower);

    const matchesBarcode = !barcodeSearch || p.barcode === barcodeSearch;

    return matchesCategory && matchesSearch && matchesBarcode;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Banner (Modern Vibrant Emerald Gradient) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-8 md:p-12 shadow-xl shadow-emerald-900/10">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-100 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Verified Siva Department Store • Somanahalli, Palacode</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Fresh Grocery & Everyday <span className="text-amber-300">Department Essentials</span>
          </h2>

          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            Order online or visit <span className="font-bold text-white">Siva Department Store</span>. Express local delivery & authentic GST billing guaranteed.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold">
              <Truck className="w-4 h-4 text-amber-300" /> Free Delivery over ₹500
            </div>
            <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold">
              <RefreshCw className="w-4 h-4 text-amber-300" /> 7-Day Easy Store Returns
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Trust & Security Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-slate-900">256-Bit SSL Secure</h5>
            <p className="text-[11px] text-slate-500 font-medium">Safe payment checkout</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-slate-900">100% Genuine</h5>
            <p className="text-[11px] text-slate-500 font-medium">Fresh quality guaranteed</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-slate-900">Official GST Invoice</h5>
            <p className="text-[11px] text-slate-500 font-medium">Clear CGST/SGST bill</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-slate-900">Central Inventory</h5>
            <p className="text-[11px] text-slate-500 font-medium">Live stock sync</p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            Explore Categories
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{filteredProducts.length} Products Found</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat._id || cat.slug}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Barcode Lookup Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 text-xs font-extrabold">
          <Barcode className="w-5 h-5 text-amber-600" />
          <span>Quick Barcode Scan / Lookup:</span>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Scan Barcode (e.g. 890100100001)..."
            value={scanBarcodeQuery}
            onChange={(e) => setScanBarcodeQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
          />
          {scanBarcodeQuery && (
            <button
              onClick={() => setScanBarcodeQuery('')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-2.5 py-2 rounded-xl"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Product Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h4 className="text-lg font-extrabold text-slate-900">No matching products found</h4>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Try adjusting your search criteria, clear category filters, or scan another barcode.
          </p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setScanBarcodeQuery(''); }}
            className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 hover:bg-emerald-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minimumStock;
            const discountPercent = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

            return (
              <div
                key={product._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-emerald-500 hover:shadow-xl transition-all duration-200 group"
              >
                {/* Product Image & Badges */}
                <div className="relative h-48 bg-slate-50 overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Stock Status Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {isOutOfStock ? (
                      <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-sm">
                        OUT OF STOCK
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> ONLY {product.stock} LEFT
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        Stock: {product.stock} {product.unitType || 'pcs'}
                      </span>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <div className="absolute top-3 right-3 bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm">
                      {discountPercent}% OFF
                    </div>
                  )}

                  {/* Barcode Tag */}
                  <div className="absolute bottom-2 left-2 bg-white/90 text-slate-500 font-mono text-[9px] px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                    CODE: {product.barcode}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                      <span>{product.brand}</span>
                      <span className="text-emerald-700 font-bold">GST {product.gstRate}%</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                      {product.description || `Fresh ${product.category} product`}
                    </p>
                  </div>

                  {/* Pricing & Add Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900">
                          ₹{product.sellingPrice}
                        </span>
                        {product.mrp > product.sellingPrice && (
                          <span className="text-xs text-slate-400 line-through font-medium">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Incl. all taxes</span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
