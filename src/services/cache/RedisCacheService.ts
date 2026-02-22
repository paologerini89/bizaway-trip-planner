import Redis from 'ioredis';
import { CacheService } from './ICacheService';

export class RedisCacheService implements CacheService {
    private redis: Redis;
    private defaultTtl: number;

    constructor(
        redisUrl?: string, 
        defaultTtlSeconds = 300, // 5 minuti default
        options?: {
            host?: string;
            port?: number;
            password?: string;
            db?: number;
        }
    ) {
        this.defaultTtl = defaultTtlSeconds;
        
        if (redisUrl) {
            this.redis = new Redis(redisUrl);
        } else {
            this.redis = new Redis({
                host: options?.host || 'localhost',
                port: options?.port || 6379,
                password: options?.password,
                db: options?.db || 0,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                lazyConnect: true
            });
        }

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.redis.on('connect', () => {
            console.log('Redis connected');
        });

        this.redis.on('error', (error) => {
            console.error('Redis error:', error);
        });

        this.redis.on('close', () => {
            console.log('Redis connection closed');
        });
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);
            const ttl = ttlSeconds || this.defaultTtl;
            
            await this.redis.setex(key, ttl, serializedValue);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async clear(): Promise<void> {
        try {
            await this.redis.flushdb();
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }

    async isConnected(): Promise<boolean> {
        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        } catch (error) {
            console.error('Cache isConnected error:', error);
            return false;
        }
    }

    // Metodi avanzati per Redis
    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    async ttl(key: string): Promise<number> {
        try {
            return await this.redis.ttl(key);
        } catch (error) {
            console.error('Cache ttl error:', error);
            return -1;
        }
    }

    async disconnect(): Promise<void> {
        await this.redis.disconnect();
    }
}