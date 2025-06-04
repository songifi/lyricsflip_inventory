export const SEARCH_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MAX_QUERY_LENGTH: 1000,
  DEFAULT_TIMEOUT: 30000,
  CACHE_TTL: 300, // 5 minutes
  ANALYTICS_RETENTION_DAYS: 90,
  RATE_LIMIT_PER_MINUTE: 100,
  
  INDICES: {
    ANALYTICS: 'search-analytics',
    CACHE: 'search-cache',
    RATE_LIMITS: 'search-rate-limits',
  },

  SEARCH_TYPES: {
    FULL_TEXT: 'full_text',
    EXACT_MATCH: 'exact_match',
    FUZZY: 'fuzzy',
    WILDCARD: 'wildcard',
  },

  AGGREGATION_SIZES: {
    CATEGORIES: 50,
    TAGS: 100,
    AUTHORS: 50,
    DEFAULT: 10,
  },
};