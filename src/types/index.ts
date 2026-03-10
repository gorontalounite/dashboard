// src/types/index.ts

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
  viewsFromAds: number;
  viewsFollowers: number;
  viewsNonFollowers: number;
  accountsReached: number;
  accountsReachedChange: number;
  interactions: number;
  interactionsFromAds: number;
  interactionsFollowers: number;
  interactionsNonFollowers: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reposts: number;
  profileVisits: number;
  profileVisitsChange: number;
  externalLinkTaps: number;
  externalLinkTapsChange: number;
  followsGained: number;
  unfollows: number;
  netFollowerGrowth: number;
}

export interface ContentStatData {
  id: string;
  reportId: string;
  type: ContentType;
  viewsPct: number;
  interactionsPct: number;
}

export interface TopContentData {
  id: string;
  reportId: string;
  type: ContentType;
  views: number;
  publishedAt: string | null;
  caption: string | null;
  rank: number;
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
  contentStats: ContentStatData[];
  topContent: TopContentData[];
  audienceData: AudienceDataType | null;
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
  // Metrics
  views: string;
  viewsFromAds: string;
  viewsFollowers: string;
  viewsNonFollowers: string;
  accountsReached: string;
  accountsReachedChange: string;
  interactions: string;
  interactionsFromAds: string;
  interactionsFollowers: string;
  interactionsNonFollowers: string;
  likes: string;
  comments: string;
  saves: string;
  shares: string;
  reposts: string;
  profileVisits: string;
  profileVisitsChange: string;
  externalLinkTaps: string;
  externalLinkTapsChange: string;
  followsGained: string;
  unfollows: string;
  netFollowerGrowth: string;
  // Content Stats
  reelsViewsPct: string;
  storiesViewsPct: string;
  postsViewsPct: string;
  reelsInteractionsPct: string;
  postsInteractionsPct: string;
  storiesInteractionsPct: string;
  // Top Content
  topContent1Caption: string;
  topContent1Views: string;
  topContent1Type: ContentType;
  topContent1Date: string;
  topContent2Caption: string;
  topContent2Views: string;
  topContent2Type: ContentType;
  topContent2Date: string;
  topContent3Caption: string;
  topContent3Views: string;
  topContent3Type: ContentType;
  topContent3Date: string;
  topContent4Caption: string;
  topContent4Views: string;
  topContent4Type: ContentType;
  topContent4Date: string;
  // Audience
  genderMen: string;
  genderWomen: string;
  age13to17: string;
  age18to24: string;
  age25to34: string;
  age35to44: string;
  age45to54: string;
  age55to64: string;
  age65plus: string;
  topCity1: string;
  topCity1Pct: string;
  topCity2: string;
  topCity2Pct: string;
  topCity3: string;
  topCity3Pct: string;
  topCity4: string;
  topCity4Pct: string;
  topCity5: string;
  topCity5Pct: string;
}
