export interface BusinessModel {
  valueProposition: string;
  revenueStreams: string[];
  costStructure: string[];
  keyPartners: string[];
}

export interface MarketingChannel {
  name: string;
  description: string;
  estimatedBudgetPercentage: number;
}

export interface MarketingPlan {
  strategyOverview: string;
  targetAudienceAnalysis: string;
  channels: MarketingChannel[];
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RoadmapPhase {
  phaseName: string;
  duration: string;
  milestones: string[];
  focusArea: string;
}

export interface Risk {
  riskName: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  probability: number; // 1-10
  mitigationStrategy: string;
}

export interface Competitor {
  name: string;
  description: string;
}

export interface DeepDiveAnalysis {
  companyName: string;
  strategy: string;
  revenueModel: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

export interface CompetitorAnalysis {
  topCompetitors: Competitor[];
  deepDive: DeepDiveAnalysis;
  sources: { title: string; url: string }[];
}

export interface BusinessStrategy {
  businessModel: BusinessModel;
  marketingPlan: MarketingPlan;
  swot: SWOT;
  roadmap: RoadmapPhase[];
  risks: Risk[];
  competitorAnalysis: CompetitorAnalysis;
  executiveSummary: string;
}

export interface UserInput {
  industry: string;
  description: string;
  locationType: string;
  marketReach: string;
  budget: string;
  targetCustomers: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  image?: string; // Base64 Data URL
}