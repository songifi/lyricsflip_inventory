import { SetMetadata } from '@nestjs/common';

export const SEARCH_CACHE_KEY = 'search_cache';

export const CacheSearch = (ttl: number = 300) => SetMetadata(SEARCH_CACHE_KEY, ttl);
 