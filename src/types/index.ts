export type Role = "ADMIN" | "VIEWER";
export type ContentType = "REELS" | "STORIES" | "POSTS" | "VIDEOS";

export interface UserSession {
  id: string;
  name: string | null;
  email: string;
  role: Role;
}

export interface MetricsData {
  id: string;
  reportId: string;
  views: number;
  accountsReached: number;
  interactions: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  followsGained: number;
  profileVisits: number;
}

export interface AudienceDataType {
  id: string;
  reportId: string;
  genderMen: number;
  genderWomen: number;
  age13to17: number;
  age18to24: number;
  age25to34: number;
  age35to44: number;
  age45to54: number;
  age55to64: number;
  age65plus: number;
  topCity1: string | null;
  topCity1Pct: number;
  topCity2: string | null;
  topCity2Pct: number;
  topCity3: string | null;
  topCity3Pct: number;
  topCity4: string | null;
  topCity4Pct: number;
  topCity5: string | null;
  topCity5Pct: number;
}

export interface ReportWithData {
  id: string;
  title: string;
  accountName: string;
  periodStart: string;
  periodEnd: string;
  shareToken: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  metrics: MetricsData | null;
  audienceData: AudienceDataType | null;
  dailyMetrics: DailyMetricData[];
  postInsights: PostInsightData[];
}

export interface ReportListItem {
  id: string;
  title: string;
  accountName: string;
  periodStart: string;
  periodEnd: string;
  shareToken: string;
  isPublic: boolean;
  createdAt: string;
  metrics: Pick<MetricsData, "views" | "interactions" | "accountsReached"> | null;
}

export interface InputFormData {
  title: string;
  accountName: string;
  periodStart: string;
  periodEnd: string;
  isPublic: boolean;
}

export interface DailyMetricData {
  id: string;
  reportId: string;
  date: string;
  views: number;
  reach: number;
  interactions: number;
  follows: number;
  profileVisits: number;
  linkClicks: number;
}

export interface PostInsightData {
  id: string;
  reportId: string;
  postId: string | null;
  permalink: string | null;
  caption: string | null;
  type: ContentType;
  publishedAt: string | null;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  follows: number;
  duration: number;
}