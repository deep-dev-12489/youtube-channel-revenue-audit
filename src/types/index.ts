export interface VideoItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  duration: string; // ISO 8601 string (e.g. PT12M30S)
  durationSeconds: number;
  durationFormatted: string; // e.g. "12:30"
  isShort: boolean;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  url: string;
  isOutlier: boolean; // > 2x average views
  outlierMultiplier: number; // e.g. 2.45
  estimatedRevenue?: {
    min: number;
    max: number;
    minInr: number;
    maxInr: number;
  };
}

export interface ChannelInfo {
  id: string;
  title: string;
  handle: string;
  description: string;
  customUrl?: string;
  avatarUrl: string;
  bannerUrl?: string;
  subscriberCount: number;
  totalViews: number;
  totalVideosCount: number;
  publishedAt?: string;
  country?: string;
}

export interface KPIData {
  totalVideos90d: number;
  weeklyUploadFrequency: number; // uploads per 7 days
  averageUploadGapDays: number; // avg days between consecutive uploads
  averageViews: number;
  medianViews: number;
  totalViews90d: number;
  totalLikes90d: number;
  totalComments90d: number;
  shortsCount: number;
  longCount: number;
  shortsPercentage: number;
  longPercentage: number;
  outlierCount: number;
  outlierRate: number; // percentage of videos that are outliers
  highestViews: number;
  lowestViews: number;
  estimatedRevenue?: {
    min90d: number;
    max90d: number;
    avgMonthlyMin: number;
    avgMonthlyMax: number;
    rpmAverage: number;
    min90dInr: number;
    max90dInr: number;
    avgMonthlyMinInr: number;
    avgMonthlyMaxInr: number;
  };
}

export interface GeminiInsights {
  niche: string;
  subNiche: string;
  channelSummary: string;
  contentPillars: string[];
  topPerformingAngles: Array<{
    angle: string;
    whyItWorks: string;
    avgMultiplier: string;
    exampleVideo?: string;
  }>;
  audiencePersona: {
    targetViewer: string;
    painPoints: string[];
    valueProposition: string;
  };
  competitorTakeaways: string[];
  growthRecommendations: string[];
  recommendedHooks: string[];
}

export interface ChannelAnalysisResponse {
  channel: ChannelInfo;
  kpis: KPIData;
  videos: VideoItem[];
  geminiInsights: GeminiInsights | null;
  fetchedAt: string;
  daysRange: number;
  source: 'api' | 'demo' | 'rss';
}

export interface ApiSettings {
  youtubeApiKey: string;
  geminiApiKey: string;
}
