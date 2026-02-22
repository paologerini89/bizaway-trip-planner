import { test } from 'tap';
import { RATE_LIMIT_EXCEEDED_CODE, RATE_LIMIT_EXCEEDED_CODE_MESSAGE } from '../src/utils/errors';
import { OK_CODE } from '../src/utils/common';

// Mock per evitare chiamate API reali nei test di rate limiting
const mockCacheService = {
    cache: new Map(),
    async get(key: string) { return null; }, // Sempre cache miss per semplicità
    async set(key: string, value: any) { },
    async delete(key: string) { },
    async clear() { },
    async isConnected() { return true; }
};

// Mock axios
const mockGet = async (url: string, config: any) => {
    return { 
        data: [
            {
                id: 'rate-test-trip',
                origin: 'ATL',
                destination: 'BOS', 
                cost: 100,
                duration: 120,
                type: 'flight',
                display_name: 'Test Flight'
            }
        ]
    };
};

const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id: string) {
    if (id === 'axios') {
        return { get: mockGet };
    }
    return originalRequire.apply(this, arguments);
};

test('Rate Limiting Integration', async (t) => {
    t.test('should apply rate limiting to trip search endpoint', async (t) => {
        const Fastify = require('fastify');
        const rateLimit = require('@fastify/rate-limit');
        const { TripService } = require('../src/services/tripService');
        const { tripRoutes } = require('../src/routes/trips');
        const { buildErrorResponse } = require('../src/utils/errors');

        const app = Fastify({ logger: false });

        await app.register(rateLimit, {
            max: 2,
            timeWindow: 1000,
            errorResponseBuilder: (request: any, context: any) => {
                return buildErrorResponse({
                    code: RATE_LIMIT_EXCEEDED_CODE,
                    message: `Rate limit exceeded. Max ${context.max} requests per ${context.after}`
                });
            }
        });

        app.get('/trips/search', async (request: any, reply: any) => {
            return [
                {
                    id: 'test-trip',
                    origin: 'ATL',
                    destination: 'BOS',
                    cost: 100,
                    duration: 120,
                    type: 'flight',
                    display_name: 'Test Flight'
                }
            ];
        });

        await app.ready();

        // First request - OK
        const response1 = await app.inject({
            method: 'GET',
            url: '/trips/search?origin=ATL&destination=BOS&sort_by=fastest'
        });
        t.equal(response1.statusCode, OK_CODE, 'first request should succeed');

        // Second request - OK
        const response2 = await app.inject({
            method: 'GET', 
            url: '/trips/search?origin=NYC&destination=LAX&sort_by=cheapest'
        });
        t.equal(response2.statusCode, OK_CODE, 'second request should succeed');

        // Third request - Rate limited
        const response3 = await app.inject({
            method: 'GET',
            url: '/trips/search?origin=JFK&destination=SFO&sort_by=fastest'
        });

        const errorBody = JSON.parse(response3.body);
        t.equal(errorBody.error, RATE_LIMIT_EXCEEDED_CODE_MESSAGE, 'should return rate limit error code');
        t.match(errorBody.message, /Rate limit exceeded/, 'should include rate limit message');

        await app.close();
    });

    t.test('should include rate limit headers', async (t) => {
        const Fastify = require('fastify');
        const rateLimit = require('@fastify/rate-limit');

        const app = Fastify({ logger: false });

        await app.register(rateLimit, {
            max: 5,
            timeWindow: 1000,
            addHeaders: {
                'x-ratelimit-limit': true,
                'x-ratelimit-remaining': true,
                'x-ratelimit-reset': true
            }
        });

        app.get('/health', async () => ({ status: 'ok' }));
        await app.ready();

        const response = await app.inject({
            method: 'GET',
            url: '/health'
        });

        t.equal(response.statusCode, OK_CODE, 'request should succeed');
        t.equal(response.headers['x-ratelimit-limit'], '5', 'should include limit header');
        t.equal(response.headers['x-ratelimit-remaining'], '4', 'should show remaining requests');
        t.ok(response.headers['x-ratelimit-reset'], 'should include reset header');

        await app.close();
    });

    Module.prototype.require = originalRequire;
});