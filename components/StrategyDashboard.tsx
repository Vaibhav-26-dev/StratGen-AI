import React, { useState } from 'react';
import { BusinessStrategy } from '../types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  CheckCircle2, AlertTriangle, TrendingUp, 
  Target, Zap, LayoutDashboard, 
  Megaphone, Activity, Map, ShieldAlert as ShieldIcon, BarChart3, ChevronDown, Globe, ExternalLink, MessageSquare
} from 'lucide-react';
import ChatAssistant from './ChatAssistant';

interface StrategyDashboardProps {
  strategy: BusinessStrategy;
  onReset: () => void;
}

// Refined Yellow/Gold Palette for Dark Theme High Contrast
const COLORS = [
  '#eab308', // yellow-500
  '#facc15', // yellow-400
  '#ca8a04', // yellow-600
  '#fef08a', // yellow-200
  '#d4d4d8', // zinc-300
  '#a1a1aa'  // zinc-400
];

const StrategyDashboard: React.FC<StrategyDashboardProps> = ({ strategy, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'swot' | 'roadmap' | 'marketing' | 'risks' | 'competitors' | 'chat'>('overview');
  const [activeSwotTab, setActiveSwotTab] = useState<'strengths' | 'weaknesses' | 'opportunities' | 'threats'>('strengths');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Safe access to arrays with default empty arrays
  const risks = strategy.risks || [];
  const riskData = risks.map(r => ({
    name: r.riskName.length > 20 ? r.riskName.substring(0, 20) + '...' : r.riskName,
    Probability: r.probability,
    fullRisk: r.riskName
  }));

  const channels = strategy.marketingPlan?.channels || [];
  const marketingData = channels.map(c => ({
    name: c.name,
    value: c.estimatedBudgetPercentage
  }));

  // Calculate dynamic height for Risk Chart based on data length
  // Base 100px + 60px per item ensures bars have enough breathing room
  const riskChartHeight = Math.max(450, riskData.length * 60 + 100);

  // Chart styling defaults for dark theme
  const chartTextColor = '#a1a1aa'; // light gray for dark mode
  const chartGridColor = '#27272a';
  const chartFontSize = 12;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      // Check dataKey to differentiate charts, or infer from properties
      const isRiskChart = payload[0].dataKey === 'Probability';
      const color = payload[0].fill || '#eab308';
      
      // Determine title: Use fullRisk for BarChart if available, else name
      const title = isRiskChart ? data.fullRisk : data.name;
      const labelText = isRiskChart ? 'Risk Probability' : 'Budget Share';
      const valueSuffix = isRiskChart ? '/10' : '%';

      return (
        <div className="bg-zinc-950/95 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-md z-50 max-w-[250px]">
          <p className="text-zinc-100 text-sm font-semibold mb-3 border-b border-zinc-800 pb-2 leading-snug">
            {title}
          </p>
          <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
                <span className="text-xs text-zinc-400 font-medium">{labelText}</span>
             </div>
             <p className="text-white font-bold text-lg font-mono tracking-tight">
                {payload[0].value}<span className="text-sm text-zinc-500 font-normal ml-0.5">{valueSuffix}</span>
             </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render Functions for Sections
  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-yellow-500/20 no-print"></div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3 relative z-10">
          <Target className="w-6 h-6 text-yellow-500" />
          Value Proposition
        </h3>
        <p className="text-zinc-300 leading-relaxed text-lg font-light relative z-10 print:text-base print:font-normal">
          {strategy.businessModel?.valueProposition || "Value proposition not available."}
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSignIcon className="w-4 h-4 text-green-400" /> Revenue Streams
          </h3>
          <ul className="space-y-3">
            {(strategy.businessModel?.revenueStreams || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400 print:text-zinc-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" /> Cost Structure
          </h3>
          <ul className="space-y-3">
            {(strategy.businessModel?.costStructure || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400 print:text-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-blue-400" /> Key Partners
          </h3>
          <ul className="space-y-3">
            {(strategy.businessModel?.keyPartners || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400 print:text-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSWOT = () => {
    const tabs = [
      { id: 'strengths', label: 'Strengths', icon: <Zap className="w-4 h-4" />, color: 'text-green-500', bg: 'bg-green-500' },
      { id: 'weaknesses', label: 'Weaknesses', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-500' },
      { id: 'opportunities', label: 'Opportunities', icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-500' },
      { id: 'threats', label: 'Threats', icon: <ShieldIcon className="w-4 h-4" />, color: 'text-yellow-500', bg: 'bg-yellow-500' }
    ] as const;

    const currentTab = tabs.find(t => t.id === activeSwotTab)!;
    const items = strategy.swot?.[activeSwotTab] || [];

    return (
      <div className="animate-fadeIn">
        {/* SWOT Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSwotTab(tab.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeSwotTab === tab.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <span className={activeSwotTab === tab.id ? tab.color : 'text-zinc-500'}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm min-h-[400px] relative overflow-hidden">
           {/* Decorative background element */}
           <div className={`absolute top-0 right-0 w-64 h-64 ${currentTab.bg} opacity-[0.03] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none`}></div>
           
           <h3 className={`text-xl font-bold mb-8 flex items-center gap-3 ${currentTab.color}`}>
              <span className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${currentTab.color}`}>
                {currentTab.icon}
              </span>
              {currentTab.label} Analysis
           </h3>

           <div className="grid gap-4">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
                     <span className={`mt-2 w-1.5 h-1.5 rounded-full ${currentTab.bg} shrink-0 group-hover:scale-125 transition-transform`}></span>
                     <p className="text-zinc-300 leading-relaxed text-base">{item}</p>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic py-10 text-center">No items available for this category.</div>
              )}
           </div>
        </div>
      </div>
    );
  };

  const renderRoadmap = () => (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-sm animate-fadeIn">
      <h3 className="text-xl font-bold text-white mb-8">Execution Roadmap</h3>
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-zinc-800">
        {(strategy.roadmap || []).map((phase, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-900 bg-yellow-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-black font-bold text-sm">
              {index + 1}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-black p-6 rounded-xl border border-zinc-800 shadow-sm hover:border-yellow-500/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-white text-lg">{phase.phaseName}</h4>
                <span className="text-xs font-mono bg-zinc-900 text-yellow-500 px-3 py-1 rounded-full border border-zinc-800">{phase.duration}</span>
              </div>
              <p className="text-xs text-zinc-500 font-bold mb-3 uppercase tracking-wider">Focus: {phase.focusArea}</p>
              <ul className="space-y-2">
                {(phase.milestones || []).map((ms, idx) => (
                    <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2 print:text-zinc-700">
                      <span className="text-yellow-500 mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full shrink-0"></span> 
                      <span>{ms}</span>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarketing = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm">
          <h3 className="font-bold text-white mb-4 text-lg">Audience Analysis</h3>
          <p className="text-zinc-400 text-sm leading-relaxed print:text-zinc-700">
            {strategy.marketingPlan?.targetAudienceAnalysis || "Analysis not available."}
          </p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm flex flex-col h-96 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white text-lg">Budget Allocation</h3>
          </div>
          <div className="w-full flex-grow min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
              <PieChart>
                <Pie
                  data={marketingData}
                  cx="50%" // Centered
                  cy="50%" // Centered vertically
                  innerRadius="50%"
                  outerRadius="70%" 
                  fill="#8884d8"
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {marketingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      fillOpacity={highlightedIndex === null || highlightedIndex === index ? 1 : 0.2}
                      stroke={highlightedIndex === index ? COLORS[index % COLORS.length] : 'none'}
                      strokeWidth={highlightedIndex === index ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex justify-center w-full">
            <div className="relative z-20 max-w-[240px] w-full">
              <select 
                className="w-full appearance-none bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-3 pr-8 py-1.5 rounded-full border border-zinc-700 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all cursor-pointer hover:bg-zinc-700 hover:text-zinc-200 truncate"
                onChange={(e) => setHighlightedIndex(e.target.value === 'all' ? null : Number(e.target.value))}
                value={highlightedIndex === null ? 'all' : highlightedIndex}
              >
                <option value="all">View All Channels</option>
                {marketingData.map((d, i) => (
                  <option key={i} value={i}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {channels.map((channel, idx) => (
          <div key={idx} className={`bg-zinc-900 p-6 rounded-xl border transition-colors ${highlightedIndex === idx ? 'border-yellow-500 bg-zinc-800/50 shadow-lg shadow-yellow-500/10' : 'border-zinc-800 shadow-sm hover:border-zinc-700'}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-white">{channel.name}</h4>
              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">{channel.estimatedBudgetPercentage}% Budget</span>
            </div>
            <p className="text-sm text-zinc-400 print:text-zinc-700">{channel.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRisks = () => (
    <div className="space-y-6 animate-fadeIn">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm flex flex-col min-w-0" style={{ height: `${riskChartHeight}px` }}>
          <h3 className="font-bold text-white mb-2">Risk Probability Assessment</h3>
          <p className="text-zinc-500 text-xs mb-6">Estimated probability score (1-10)</p>
          <div className="w-full flex-grow min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
              <BarChart data={riskData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                <XAxis type="number" domain={[0, 10]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={150} 
                  tick={{fontSize: chartFontSize, fill: chartTextColor}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: chartGridColor, opacity: 0.4}} />
                <Bar 
                  dataKey="Probability" 
                  fill="#eab308" 
                  radius={[0, 4, 4, 0]} 
                  barSize={28} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4">
          {risks.map((risk, idx) => (
            <div key={idx} className="bg-zinc-900 p-6 rounded-xl border-l-4 border-l-red-500 border-y border-r border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-lg">{risk.riskName}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  risk.impactLevel === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  risk.impactLevel === 'Medium' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                  'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }`}>
                  {risk.impactLevel} Impact
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mitigation Strategy</p>
                <p className="text-zinc-300 mt-2 text-sm print:text-zinc-700">{risk.mitigationStrategy}</p>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
  
  const renderCompetitors = () => (
    <div className="space-y-6 animate-fadeIn">
       {/* Top 3 Competitors */}
       <div className="grid md:grid-cols-3 gap-6">
          {(strategy.competitorAnalysis?.topCompetitors || []).map((comp, idx) => (
             <div key={idx} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm border border-blue-500/20">
                      {idx + 1}
                   </div>
                   <h3 className="font-bold text-white text-lg truncate">{comp.name}</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">{comp.description}</p>
             </div>
          ))}
       </div>

       {/* Deep Dive */}
       {strategy.competitorAnalysis?.deepDive && (
         <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                    <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Market Leader Analysis</h4>
                    <h3 className="text-xl font-bold text-white">{strategy.competitorAnalysis.deepDive.companyName}</h3>
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Core Strategy</h4>
                    <p className="text-zinc-300 leading-relaxed text-sm">{strategy.competitorAnalysis.deepDive.strategy}</p>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Revenue Model</h4>
                    <p className="text-zinc-300 leading-relaxed text-sm">{strategy.competitorAnalysis.deepDive.revenueModel}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                 <div className="bg-black/40 p-5 rounded-xl border border-zinc-800/50">
                    <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2 text-sm"><Zap className="w-4 h-4"/> Strengths</h4>
                    <ul className="space-y-2">
                        {(strategy.competitorAnalysis.deepDive.strengths || []).map((s, i) => (
                            <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
                 <div className="bg-black/40 p-5 rounded-xl border border-zinc-800/50">
                    <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4"/> Weaknesses</h4>
                    <ul className="space-y-2">
                        {(strategy.competitorAnalysis.deepDive.weaknesses || []).map((w, i) => (
                            <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                <span>{w}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
                 <div className="bg-black/40 p-5 rounded-xl border border-zinc-800/50">
                    <h4 className="font-bold text-yellow-400 mb-3 flex items-center gap-2 text-sm"><Target className="w-4 h-4"/> Your Opportunity</h4>
                    <ul className="space-y-2">
                        {(strategy.competitorAnalysis.deepDive.opportunities || []).map((o, i) => (
                            <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-yellow-500 mt-1.5 shrink-0"></span>
                                <span>{o}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
            </div>
         </div>
       )}

       {/* Sources */}
       {strategy.competitorAnalysis?.sources && strategy.competitorAnalysis.sources.length > 0 && (
         <div className="mt-8 border-t border-zinc-800 pt-6">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" className="w-3 h-3 opacity-50 grayscale" alt="Google" />
                Verified Sources (Google Search Grounding)
            </h4>
            <div className="flex flex-wrap gap-3">
                {strategy.competitorAnalysis.sources.map((source, idx) => (
                    <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors group">
                        <span className="truncate max-w-[200px]">{source.title || new URL(source.url).hostname}</span>
                        <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                ))}
            </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* PROFESSIONAL COVER PAGE (Print Only) */}
      <div className="print-cover-page hidden print:flex">
         <div className="mb-12 transform scale-125">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-black text-yellow-500 mb-6 border-4 border-yellow-500 shadow-xl">
               <BarChart3 size={48} />
            </div>
            <h1 className="text-6xl font-extrabold text-black mb-4 tracking-tighter">StratGen <span className="text-yellow-600">AI</span></h1>
            <div className="h-1 w-32 bg-yellow-500 mx-auto rounded-full"></div>
         </div>
         
         <div className="w-full max-w-3xl border-t border-b border-gray-200 py-12 my-8 px-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 font-sans">Strategic Business Analysis</h2>
            <p className="text-xl text-gray-600 leading-relaxed font-serif italic">
              "{strategy.executiveSummary}"
            </p>
         </div>

         <div className="mt-16 grid grid-cols-2 gap-16 text-left">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Generated Date</p>
              <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Report ID</p>
              <p className="text-lg font-bold text-gray-800">#{Math.floor(Math.random() * 100000).toString().padStart(6, '0')}</p>
            </div>
         </div>
         
         <div className="mt-auto pb-8">
             <p className="text-sm text-gray-400 font-medium">Confidential &bull; Generated by StratGen AI &bull; {new Date().getFullYear()}</p>
         </div>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-800 pb-8 print:hidden">
        <div className="flex-grow">
          <h2 className="text-3xl font-bold text-white">Your Generated Strategy</h2>
          <p className="text-zinc-400 mt-2 max-w-2xl">{strategy.executiveSummary}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 no-print">
          <button 
            onClick={onReset}
            className="px-4 py-2.5 text-sm font-bold text-black bg-yellow-500 border border-yellow-500 rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
          >
            Create New
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Hidden in Print) */}
      <div className="flex overflow-x-auto gap-2 scrollbar-hide no-print">
        <TabButton id="overview" label="Overview" icon={<LayoutDashboard size={18} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="marketing" label="Marketing" icon={<Megaphone size={18} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="swot" label="SWOT" icon={<Activity size={18} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="competitors" label="Competitors" icon={<Globe size={18} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="roadmap" label="Roadmap" icon={<Map size={18} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="risks" label="Risks" icon={<ShieldIcon size={18} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="chat" label="Consultant" icon={<MessageSquare size={18} />} active={activeTab} onClick={setActiveTab} />
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="block">
            <div className="hidden print:block mb-6 mt-4">
              <h2 className="text-2xl font-bold text-black border-b border-gray-300 pb-2">Business Overview</h2>
            </div>
            {renderOverview()}
          </div>
        )}

        {/* Marketing */}
        {activeTab === 'marketing' && (
          <div className="block">
            <div className="hidden print:block mb-6 mt-8 page-break">
              <h2 className="text-2xl font-bold text-black border-b border-gray-300 pb-2">Marketing Plan</h2>
            </div>
            {renderMarketing()}
          </div>
        )}

        {/* SWOT */}
        {activeTab === 'swot' && (
          <div className="block">
            <div className="hidden print:block mb-6 mt-8 page-break">
              <h2 className="text-2xl font-bold text-black border-b border-gray-300 pb-2">SWOT Analysis</h2>
            </div>
            {renderSWOT()}
          </div>
        )}

        {/* Competitors */}
        {activeTab === 'competitors' && (
          <div className="block">
             <div className="hidden print:block mb-6 mt-8 page-break">
              <h2 className="text-2xl font-bold text-black border-b border-gray-300 pb-2">Competitor Analysis</h2>
            </div>
            {renderCompetitors()}
          </div>
        )}

        {/* Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="block">
            <div className="hidden print:block mb-6 mt-8 page-break">
              <h2 className="text-2xl font-bold text-black border-b border-gray-300 pb-2">Execution Roadmap</h2>
            </div>
            {renderRoadmap()}
          </div>
        )}

        {/* Risks */}
        {activeTab === 'risks' && (
          <div className="block">
            <div className="hidden print:block mb-6 mt-8 page-break">
              <h2 className="text-2xl font-bold text-black border-b border-gray-300 pb-2">Risk Assessment</h2>
            </div>
            {renderRisks()}
          </div>
        )}

        {/* Chat Assistant */}
        {activeTab === 'chat' && (
          <div className="block no-print">
             <ChatAssistant strategy={strategy} />
          </div>
        )}
      </div>
      
      {/* Print Footer for Last Page */}
      <div className="hidden print:block mt-12 pt-6 border-t border-zinc-200 text-center">
        <p className="text-xs text-zinc-400">StratGen AI &copy; {new Date().getFullYear()} - Professional Strategy Report</p>
      </div>
    </div>
  );
};

// Helper Components for Dashboard
const TabButton = ({ id, label, icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
      active === id
        ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20'
        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Minimal Icon Wrappers
const DollarSignIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default StrategyDashboard;