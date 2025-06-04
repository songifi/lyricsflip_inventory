export interface TopQuery {
  query: string;
  count: number;
}

export interface SearchVolumePoint {
  timestamp: string;
  count: number;
}

export interface SearchAnalyticsResult {
  totalSearches: number;
  uniqueQueries: number;
  avgResponseTime: number;
  topQueries: TopQuery[];
  zeroResultsCount: number;
  searchVolumeOverTime: SearchVolumePoint[];
  responseTimePercentiles: Record<string, number>;
}
