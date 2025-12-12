import React, { useState } from 'react';
import { UserInput } from '../types';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface InputFormProps {
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    industry: '',
    description: '',
    locationType: 'Urban',
    marketReach: 'State-level',
    budget: '',
    targetCustomers: ''
  });
  const [currency, setCurrency] = useState('USD');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      budget: `${currency} ${formData.budget}`
    };
    onSubmit(submissionData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-zinc-800 p-8 relative overflow-hidden animate-fadeIn" aria-labelledby="form-title">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
      <h2 id="form-title" className="sr-only">Business Strategy Input Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-zinc-300 mb-2">
            Industry / Business Sector
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            required
            aria-required="true"
            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
            placeholder="e.g. Retail Coffee Shop, SaaS Platform, E-commerce..."
            value={formData.industry}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
            Business Idea Description <span className="text-zinc-500 font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
            placeholder="Briefly describe your idea (50-100 words)..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label htmlFor="locationType" className="block text-sm font-medium text-zinc-300 mb-2">
              Customer Geography
            </label>
            <select
              id="locationType"
              name="locationType"
              required
              aria-required="true"
              className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all appearance-none cursor-pointer"
              value={formData.locationType}
              onChange={handleChange}
            >
              <option value="Urban">Urban</option>
              <option value="Semi-urban">Semi-urban</option>
              <option value="Rural">Rural</option>
              <option value="International markets">International markets</option>
            </select>
          </div>

          <div>
             <label htmlFor="marketReach" className="block text-sm font-medium text-zinc-300 mb-2">
              Market Location
            </label>
            <select
              id="marketReach"
              name="marketReach"
              required
              aria-required="true"
              className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all appearance-none cursor-pointer"
              value={formData.marketReach}
              onChange={handleChange}
            >
              <option value="Specific local area">Specific local area (city/town)</option>
              <option value="State-level">State-level</option>
              <option value="All-India">All-India</option>
              <option value="Global">Global</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-zinc-300 mb-2">
              Estimated Budget / Capital
            </label>
            <div className="flex gap-2">
              <label htmlFor="currency-select" className="sr-only">Currency</label>
              <select
                id="currency-select"
                value={currency}
                onChange={handleCurrencyChange}
                className="bg-black/50 border border-zinc-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all cursor-pointer min-w-[100px]"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
              <input
                type="text"
                id="budget"
                name="budget"
                required
                aria-required="true"
                className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                placeholder={currency === 'USD' ? "e.g. 50,000" : "e.g. 10 Lakhs"}
                value={formData.budget}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="targetCustomers" className="block text-sm font-medium text-zinc-300 mb-2">
              Customer Type
            </label>
            <input
              type="text"
              id="targetCustomers"
              name="targetCustomers"
              required
              aria-required="true"
              className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              placeholder="Age, profession, income, B2B/B2C..."
              value={formData.targetCustomers}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>Generating Strategy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>Generate Business Strategy</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;