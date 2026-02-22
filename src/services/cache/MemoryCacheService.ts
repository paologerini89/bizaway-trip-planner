import { CacheService } from './ICacheService';

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export class MemoryCacheService implements CacheService {
    private cache = new Map<string, CacheItem<any>>();
    private defaultTtl: number;
    private cleanupInterval?: NodeJS.Timeout;

    constructor(defaultTtlSeconds = 300) { // 5 minuti default
        this.defaultTtl = defaultTtlSeconds * 1000;
    }

    async get<T>(key: string): Promise<T | null> {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        const now = Date.now();
        const itemTtl = item.ttl || this.defaultTtl;
        
        if (now - item.timestamp > itemTtl) {
            this.cache.delete(key);
            return null;
        }

        return item.value as T;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl;
        
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }

    async isConnected(): Promise<boolean> {
        return true; // Memory cache è sempre "connesso"
    }

    // Metodo utile per pulizia automatica
    private cleanup(): void {
        const now = Date.now();
        
        for (const [key, item] of this.cache.entries()) {
            const itemTtl = item.ttl || this.defaultTtl;
            if (now - item.timestamp > itemTtl) {
                this.cache.delete(key);
            }
        }
    }

    // Avvia pulizia automatica ogni 5 minuti
    startCleanup(): void {
        if (this.cleanupInterval) {
            return; // Cleanup già avviato
        }
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    // Ferma pulizia automatica 
    stopCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }
}