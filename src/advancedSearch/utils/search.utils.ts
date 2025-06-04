export class SearchUtils {
  static sanitizeQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    return query
      .trim()
      .replace(/[<>{}[\]]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 1000); // Limit length
  }

  static buildHighlightConfig(fields: string[]) {
    const highlightFields = {};
    
    fields.forEach(field => {
      highlightFields[field] = {
        fragment_size: 150,
        number_of_fragments: 3,
      };
    });

    return {
      fields: highlightFields,
      pre_tags: ['<mark>'],
      post_tags: ['</mark>'],
      require_field_match: false,
    };
  }

  static parseFilters(filters: Record<string, any>): any[] {
    const filterClauses = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (Array.isArray(value) && value.length > 0) {
        filterClauses.push({
          terms: { [`${key}.keyword`]: value },
        });
      } else if (typeof value === 'object' && (value.from !== undefined || value.to !== undefined)) {
        const rangeQuery: any = {};
        if (value.from !== undefined) rangeQuery.gte = value.from;
        if (value.to !== undefined) rangeQuery.lte = value.to;
        
        filterClauses.push({
          range: { [key]: rangeQuery },
        });
      } else if (typeof value === 'boolean') {
        filterClauses.push({
          term: { [key]: value },
        });
      } else {
        filterClauses.push({
          term: { [`${key}.keyword`]: value },
        });
      }
    });

    return filterClauses;
  }

  static calculateRelevanceScore(hit: any, boostFactors: Record<string, number> = {}): number {
    let score = hit._score || 0;

    // Apply custom boost factors
    Object.entries(boostFactors).forEach(([field, boost]) => {
      if (hit._source[field]) {
        score *= boost;
      }
    });

    // Recency boost
    if (hit._source.createdAt) {
      const daysSinceCreation = (Date.now() - new Date(hit._source.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0.5, 1 - (daysSinceCreation / 365)); // Decay over a year
      score *= recencyBoost;
    }

    return score;
  }
}