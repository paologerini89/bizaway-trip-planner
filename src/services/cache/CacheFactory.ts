import { CacheService } from './ICacheService';
import { MemoryCacheService } from './MemoryCacheService';
import { RedisCacheService } from './RedisCacheService';

export type CacheType = 'memory' | 'redis';

export interface CacheConfig {
    type: CacheType;
    defaultTtlSeconds?: number;
    redis?: {
        url?: string;
        host?: string;
        port?: number;
        password?: string;
        db?: number;
    };
}

export class CacheFactory {
    static create(config: CacheConfig): CacheService {
        const { type, defaultTtlSeconds = 300 } = config;

        switch (type) {
            case 'redis':
                return new RedisCacheService(
                    config.redis?.url,
                    defaultTtlSeconds,
                    config.redis
                );
            
            case 'memory':
            default:
                const memoryCache = new MemoryCacheService(defaultTtlSeconds);
                memoryCache.startCleanup(); // Avvia cleanup automatico
                return memoryCache;
        }
    }

    static fromEnvironment(): CacheService {
        const cacheType = (process.env.CACHE_TYPE as CacheType) || 'memory';
        const defaultTtl = parseInt(process.env.CACHE_TTL_SECONDS || '300');

        const config: CacheConfig = {
            type: cacheType,
            defaultTtlSeconds: defaultTtl,
            redis: {
                url: process.env.REDIS_URL,
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
                password: process.env.REDIS_PASSWORD,
                db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : undefined,
            }
        };

        return CacheFactory.create(config);
    }
}