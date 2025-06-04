export interface FacetedSearchHit {
  id: string;
  source: any;
  score: number;
  index: string;
}

export interface FacetedSearchResult {
  hits: FacetedSearchHit[];
  total: number;
  facets: Record<string, any>;
  took: number;
}