import React, { useState } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { PlanTier, RegisterOrgDto } from '../types';
import { 
  Building2, 
  Warehouse, 
  User, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  DollarSign,
  MapPin,
  ShieldCheck
} from 'lucide-react';

export const RegisterOrgModal: React.FC = () => {
  const { isRegisterOrgModalOpen, setIsRegisterOrgModalOpen, registerOrganization } = useOmniStock();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<RegisterOrgDto>({
    name: '',
    industry: 'eCommerce & DTC',
    country: 'United States',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    plan: 'ENTERPRISE',
    primaryWarehouseName: 'Primary Distribution Hub',
    primaryWarehouseCode: 'WH-HUB-01',
    primaryWarehouseCity: 'Dallas',
    primaryWarehouseState: 'TX',
    primaryWarehouseAddress: '100 Logistics Blvd, Dallas, TX 75201',
    adminName: 'Lead Operations Director',
    adminEmail: 'admin@company.com',
  });

  if (!isRegisterOrgModalOpen) return null;

  const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar (USD $)' },
    { code: 'EUR', symbol: '€', name: 'Euro (EUR €)' },
    { code: 'GBP', symbol: '£', name: 'British Pound (GBP £)' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR ₹)' },
    { code: 'CAD', symbol: '$', name: 'Canadian Dollar (CAD $)' },
    { code: 'AUD', symbol: '$', name: 'Australian Dollar (AUD $)' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY ¥)' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED د.إ)' },
  ];

  const INDUSTRIES = [
    'eCommerce & DTC',
    'Wholesale Distribution',
    'Electronics & Hardware',
    'Manufacturing & Assembly',
    'Pharmaceuticals & Healthcare',
    'Apparel & Fashion',
    'Automotive Parts',
    'Food & Beverage / Cold-Chain',
  ];

  const handleCurrencyChange = (currencyCode: string) => {
    const found = CURRENCIES.find((c) => c.code === currencyCode);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        defaultCurrency: found.code,
        currencySymbol: found.symbol,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    await registerOrganization(formData);
    setIsRegisterOrgModalOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">Register New Organization</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Zoho Inventory Architecture
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set up a new isolated multi-tenant company, currency rules, and primary warehouse
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRegisterOrgModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-zinc-950/40 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? 'bg-sky-500 text-zinc-950' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-semibold ${step === 1 ? 'text-white' : 'text-zinc-400'}`}>
              Business Profile
            </span>
          </div>
          <div className="h-0.5 flex-1 mx-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2
                  ? 'bg-sky-500 text-zinc-950'
                  : step > 2
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-semibold ${step === 2 ? 'text-white' : 'text-zinc-400'}`}>
              Primary Warehouse
            </span>
          </div>
          <div className="h-0.5 flex-1 mx-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-sky-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              3
            </span>
            <span className={`text-xs font-semibold ${step === 3 ? 'text-white' : 'text-zinc-400'}`}>
              Administrator & Plan
            </span>
          </div>
        </div>

        {/* Step Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* STEP 1: Business Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Company / Organization Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Global Logistics, Nordic Retailers AS..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Industry Sector</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Base Accounting Currency *</label>
                  <select
                    value={formData.defaultCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Country / Headquarters</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United States, United Kingdom, Germany, India..."
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Subscription Plan Tier</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as PlanTier })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="STARTER">Starter Tier (1 Warehouse / 1,000 SKUs)</option>
                    <option value="PROFESSIONAL">Professional Tier (5 Warehouses / 25,000 SKUs)</option>
                    <option value="ENTERPRISE">Enterprise Tier (Unlimited / Multi-Region Sharding)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Primary Warehouse Setup */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2">
                <Warehouse className="w-4 h-4 shrink-0 text-sky-400" />
                <span>Every organization starts with an initial primary warehouse for putaway and fulfillment.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Warehouse Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.primaryWarehouseName}
                    onChange={(e) => setFormData({ ...formData, primaryWarehouseName: e.target.value })}
                    placeholder="e.g. Central Megahub Dallas"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Facility Short Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.primaryWarehouseCode}
                    onChange={(e) => setFormData({ ...formData, primaryWarehouseCode: e.target.value })}
                    placeholder="e.g. WH-DAL-01"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.primaryWarehouseCity}
                    onChange={(e) => setFormData({ ...formData, primaryWarehouseCity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">State / Province</label>
                  <input
                    type="text"
                    value={formData.primaryWarehouseState}
                    onChange={(e) => setFormData({ ...formData, primaryWarehouseState: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Physical Facility Street Address</label>
                <input
                  type="text"
                  value={formData.primaryWarehouseAddress}
                  onChange={(e) => setFormData({ ...formData, primaryWarehouseAddress: e.target.value })}
                  placeholder="e.g. 100 Logistics Blvd, Suite 200..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Admin & Launch */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Administrator Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Ready Review Card */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ready to Provision Isolated Multi-Tenant Partition</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 pt-1">
                  <div>Company: <strong className="text-zinc-200">{formData.name || 'Not set'}</strong></div>
                  <div>Currency: <strong className="text-zinc-200">{formData.defaultCurrency} ({formData.currencySymbol})</strong></div>
                  <div>Warehouse: <strong className="text-zinc-200">{formData.primaryWarehouseCode}</strong></div>
                  <div>Plan Tier: <strong className="text-sky-400">{formData.plan}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 && !formData.name}
                onClick={() => setStep((s) => (s + 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 disabled:opacity-40 transition-colors shadow-lg shadow-sky-500/20"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!formData.name}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-xs font-bold text-zinc-950 transition-all shadow-xl shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4 text-zinc-950" />
                Provision & Launch Organization
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
