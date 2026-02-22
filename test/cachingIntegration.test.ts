import { test } from 'tap';
import { MemoryCacheService } from '../src/services/cache';

test('TripService with real caching integration', async (t) => {
    // Mock axios con contatore chiamate
    let apiCallCount = 0;
    const countingMockGet = async (url: string, config: any) => {
        apiCallCount++;
        return { 
            data: [
                {
                    id: 'cached-trip-1',
                    origin: 'NYC',
                    destination: 'LAX',
                    cost: 150, 
                    duration: 200,
                    type: 'flight',
                    display_name: 'Flight from NYC to LAX'
                }
            ]
        };
    };

    // Override del modulo axios
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    Module.prototype.require = function(id: string) {
        if (id === 'axios') {
            return { get: countingMockGet };
        }
        return originalRequire.apply(this, arguments);
    };

    // Crea cache service reale
    const realCacheService = new MemoryCacheService(5); // 5 secondi TTL

    const { TripService } = require('../src/services/tripService');
    const service = new TripService('http://api.example.com', 'test-key', realCacheService);

    apiCallCount = 0;

    t.test('should demonstrate caching behavior', async (t) => {
        // Prima chiamata
        const result1 = await service.searchTrips('NYC', 'LAX', 'cheapest');
        t.equal(apiCallCount, 1, 'first call should hit API');
        t.equal(result1.length, 1, 'should return results');

        // Seconda chiamata immediata - dovrebbe usare cache
        const result2 = await service.searchTrips('NYC', 'LAX', 'cheapest');
        t.equal(apiCallCount, 1, 'second call should use cache');
        t.same(result1, result2, 'cached results should be identical');

        // Chiamata con parametro diverso - dovrebbe chiamare API
        const result3 = await service.searchTrips('NYC', 'LAX', 'fastest');
        t.equal(apiCallCount, 2, 'different sort should call API');
    });

    Module.prototype.require = originalRequire;
});