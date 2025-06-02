
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheMetricsService {
  private hitCounter = 0;
  private missCounter = 0;

  incrementHit() { this.hitCounter++; }
  incrementMiss() { this.missCounter++; }

  getMetrics() {
    const total = this.hitCounter + this.missCounter;
    const hitRatio = total > 0 ? (this.hitCounter / total) * 100 : 0;
    
    return {
      hits: this.hitCounter,
      misses: this.missCounter,
      hitRatio: `${hitRatio.toFixed(2)}%`,
    };
  }
}