export interface SearchHit {
  id: string;
  source: any;
  score: number;
  highlight: Record<string, string[]>;
  index: string;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  maxScore: number;
  aggregations: Record<string, any>;
  took: number;
}
