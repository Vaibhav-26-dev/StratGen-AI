import React from 'react';
import { Eye, MonitorSmartphone, X, Moon, Sun } from 'lucide-react';

interface AccessibilityControlsProps {
  fontSize: 'normal' | 'large' | 'xl';
  setFontSize: (size: 'normal' | 'large' | 'xl') => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  fontSize, setFontSize, highContrast, setHighContrast, theme, setTheme, isOpen, onClose
}) => {
  if (!isOpen) return null;

  return (
    <div 
        className="absolute top-20 right-4 z-50 bg-zinc-900 border border-zinc-700 p-5 rounded-xl shadow-2xl w-80 animate-in fade-in slide-in-from-top-2 high-contrast:border-white high-contrast:bg-black" 
        role="dialog" 
        aria-label="Accessibility Settings"
        aria-modal="true"
    >
      <div className="flex justify-between items-center mb-5 border-b border-zinc-800 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2 text-lg">
            <MonitorSmartphone className="w-5 h-5 text-yellow-500" aria-hidden="true" /> 
            Accessibility
        </h3>
        <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-colors focus:ring-2 focus:ring-yellow-500" 
            aria-label="Close settings"
        >
            <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Font Size Control */}
        <div>
            <label id="font-size-label" className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Font Size</label>
            <div className="flex bg-zinc-950 rounded-lg p-1.5 border border-zinc-800 gap-1" role="group" aria-labelledby="font-size-label">
                {(['normal', 'large', 'xl'] as const).map((size) => (
                    <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all focus:ring-2 focus:ring-yellow-500 focus:outline-none ${
                            fontSize === size 
                            ? 'bg-yellow-500 text-black shadow-lg' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                        aria-pressed={fontSize === size}
                        aria-label={`Set font size to ${size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra Large'}`}
                    >
                        {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                    </button>
                ))}
            </div>
        </div>

        {/* Theme Control */}
        <div>
            <label id="theme-label" className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Display Theme</label>
            <div className="flex bg-zinc-950 rounded-lg p-1.5 border border-zinc-800 gap-1" role="group" aria-labelledby="theme-label">
                 <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none ${
                        theme === 'light' 
                        ? 'bg-zinc-100 text-zinc-900 shadow-md' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                    aria-pressed={theme === 'light'}
                    disabled={highContrast} // Theme doesn't matter in HC mode
                 >
                    <Sun className="w-4 h-4" /> Light
                 </button>
                 <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none ${
                        theme === 'dark' 
                        ? 'bg-zinc-800 text-white shadow-md' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                    aria-pressed={theme === 'dark'}
                    disabled={highContrast}
                 >
                    <Moon className="w-4 h-4" /> Dark
                 </button>
            </div>
        </div>

        {/* High Contrast Toggle */}
        <div className={`transition-opacity ${highContrast ? 'opacity-100' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white flex items-center gap-2 cursor-pointer" htmlFor="hc-toggle">
                    <Eye className="w-4 h-4 text-zinc-400" aria-hidden="true" /> 
                    High Contrast Mode
                </label>
                <button
                    id="hc-toggle"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`w-14 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${highContrast ? 'bg-yellow-500' : 'bg-zinc-700'}`}
                    aria-pressed={highContrast}
                    aria-label={highContrast ? "Disable High Contrast Mode" : "Enable High Contrast Mode"}
                >
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${highContrast ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Overrides theme to provide maximum visibility with a pure black background and yellow accents.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityControls;