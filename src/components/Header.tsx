import React, { useState } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { UserRole } from '../types';
import { 
  Boxes, 
  Search, 
  Scan, 
  Command, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Plus,
  Warehouse,
  Package,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    organizations,
    currentOrg,
    setCurrentOrg,
    currentUserRole,
    setCurrentUserRole,
    setIsRegisterOrgModalOpen,
    setIsCreateWarehouseModalOpen,
    setIsCreateItemModalOpen,
    setIsBarcodeModalOpen,
    setIsCommandPaletteOpen,
    notification,
  } = useOmniStock();

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 flex items-center justify-between">
        {/* Left: Brand & Tenant Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Boxes className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">OmniStock</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-zinc-800 text-sky-400 rounded border border-zinc-700">
                  Zoho WMS
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

          {/* Organization Switcher & Register Option */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs hover:border-zinc-700 cursor-pointer transition-all">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <select
                aria-label="Select Tenant Organization"
                value={currentOrg.id}
                onChange={(e) => {
                  if (e.target.value === 'REGISTER_NEW') {
                    setIsRegisterOrgModalOpen(true);
                  } else {
                    const org = organizations.find((o) => o.id === e.target.value);
                    if (org) setCurrentOrg(org);
                  }
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
              >
                <optgroup label="Active Registered Organizations">
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-zinc-900 text-white">
                      {org.name} ({org.defaultCurrency} {org.currencySymbol})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Tenant Management">
                  <option value="REGISTER_NEW" className="bg-zinc-900 text-sky-400 font-bold">
                    + Register New Organization...
                  </option>
                </optgroup>
              </select>
              <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {currentOrg.plan}
              </span>
            </div>

            {/* Quick Register Org Button (Zoho-style prominent trigger) */}
            <button
              onClick={() => setIsRegisterOrgModalOpen(true)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold transition-colors"
              title="Register a brand new company / organization"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Org</span>
            </button>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-6">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span>Search items, warehouses, orders...</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </button>
        </div>

        {/* Right: Zoho "+ Quick Create", Barcode Scan, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Zoho-style Global "+ Quick Create" Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isQuickCreateOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsQuickCreateOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  New Entity Creation
                </div>
                <button
                  onClick={() => setIsRegisterOrgModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors text-left"
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>Register Organization</span>
                </button>
                <button
                  onClick={() => setIsCreateWarehouseModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors text-left"
                >
                  <Warehouse className="w-4 h-4 text-indigo-400" />
                  <span>Add Warehouse Facility</span>
                </button>
                <button
                  onClick={() => setIsCreateItemModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors text-left"
                >
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>New Item / SKU Line</span>
                </button>
              </div>
            )}
          </div>

          {/* Barcode Scanner Button */}
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700"
            title="Open Handheld Barcode Scanner"
          >
            <Scan className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">Scan Barcode</span>
          </button>

          {/* Role Impersonation Switcher (RBAC) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <select
              aria-label="Select User Role"
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="OWNER" className="bg-zinc-900 text-white">Owner</option>
              <option value="ADMIN" className="bg-zinc-900 text-white">Admin</option>
              <option value="WAREHOUSE_MANAGER" className="bg-zinc-900 text-white">Warehouse Mgr</option>
              <option value="STAFF" className="bg-zinc-900 text-white">Staff</option>
              <option value="ACCOUNTANT" className="bg-zinc-900 text-white">Accountant</option>
            </select>
          </div>
        </div>
      </header>

      {/* Global Notification Banner / Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                : notification.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/30 text-amber-200'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                : 'bg-zinc-900/95 border-zinc-700 text-zinc-200'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {notification.type === 'info' && <HelpCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            <div className="text-xs font-medium leading-relaxed">{notification.message}</div>
          </div>
        </div>
      )}
    </>
  );
};
