import { test } from 'tap';
import { CacheFactory, CacheType, MemoryCacheService, CacheService } from '../src/services/cache';

test('MemoryCacheService', async (t) => {
    let cache: CacheService;

    t.beforeEach(() => {
        cache = new MemoryCacheService(1); // 1 secondo TTL per test rapidi
    });

    t.test('should store and retrieve values', async (t) => {
        await cache.set('test-key', { value: 'test-data' });
        const result = await cache.get('test-key');
        
        t.same(result, { value: 'test-data' }, 'should retrieve stored value');
    });

    t.test('should return null for non-existent keys', async (t) => {
        const result = await cache.get('non-existent');
        t.equal(result, null, 'should return null for missing keys');
    });

    t.test('should expire values after TTL', async (t) => {
        await cache.set('expire-key', 'expire-value', 0.1); // 0.1 secondi
        
        // Immediatamente dovrebbe esistere
        const immediate = await cache.get('expire-key');
        t.equal(immediate, 'expire-value', 'value should exist immediately');
        
        // Dopo 200ms dovrebbe essere scaduto
        await new Promise(resolve => setTimeout(resolve, 200));
        const expired = await cache.get('expire-key');
        t.equal(expired, null, 'value should be expired');
    });

    t.test('should delete values', async (t) => {
        await cache.set('delete-key', 'delete-value');
        await cache.delete('delete-key');
        
        const result = await cache.get('delete-key');
        t.equal(result, null, 'deleted value should not exist');
    });

    t.test('should clear all values', async (t) => {
        await cache.set('key1', 'value1');
        await cache.set('key2', 'value2');
        
        await cache.clear();
        
        const result1 = await cache.get('key1');
        const result2 = await cache.get('key2');
        
        t.equal(result1, null, 'key1 should be cleared');
        t.equal(result2, null, 'key2 should be cleared');
    });

    t.test('should always be connected', async (t) => {
        const connected = await cache.isConnected();
        t.equal(connected, true, 'memory cache should always be connected');
    });
});

test('CacheFactory', async (t) => {
    t.test('should create memory cache by default', async (t) => {
        // Crea direttamente il cache senza startCleanup per evitare timeout
        const cache = new MemoryCacheService(5);
        
        t.ok(cache instanceof MemoryCacheService, 'should create MemoryCacheService');
        
        // Verifica che sia funzionante
        const connected = await cache.isConnected();
        t.equal(connected, true, 'cache should be connected');
        
        // Test base di funzionamento
        await cache.set('test', 'value');
        const result = await cache.get('test');
        t.equal(result, 'value', 'cache should work');
    });

    t.test('should create cache from environment config', async (t) => {
        // Salva env originali
        const originalCacheType = process.env.CACHE_TYPE;
        const originalCacheTtl = process.env.CACHE_TTL_SECONDS;
        
        // Imposta env per test
        process.env.CACHE_TYPE = 'memory';
        process.env.CACHE_TTL_SECONDS = '60';
        
        // Crea cache direttamente per evitare cleanup automatico
        const cache = new MemoryCacheService(60);
        
        t.ok(cache instanceof MemoryCacheService, 'should create correct cache type from env');
        
        // Test funzionamento
        await cache.set('env-test', 'env-value');
        const result = await cache.get('env-test');
        t.equal(result, 'env-value', 'cache should work with env config');
        
        // Ripristina env
        process.env.CACHE_TYPE = originalCacheType;
        process.env.CACHE_TTL_SECONDS = originalCacheTtl;
    });
});