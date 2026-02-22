import { test } from 'tap';
import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { buildErrorResponse, RATE_LIMIT_EXCEEDED_CODE, RATE_LIMIT_EXCEEDED_CODE_MESSAGE } from '../src/utils/errors';
import { OK_CODE } from '../src/utils/common';

test('Rate Limiting', async (t) => {
    let app: any;

    t.beforeEach(async () => {
        app = Fastify({ logger: false });
        
        await app.register(rateLimit, {
            max: 3,
            timeWindow: 1000,
            errorResponseBuilder: (request: any, context: any) => {
                return buildErrorResponse({
                    code: RATE_LIMIT_EXCEEDED_CODE,
                    message: `Rate limit exceeded. Max ${context.max} requests per ${context.after}. Try again in ${Math.round(context.ttl / 1000)} seconds.`
                });
            },
            addHeaders: {
                'x-ratelimit-limit': true,
                'x-ratelimit-remaining': true,
                'x-ratelimit-reset': true
            }
        });

        app.get('/test', async (request: any, reply: any) => {
            return { message: 'success' };
        });

        await app.ready();
    });

    t.afterEach(async () => {
        await app.close();
    });

    t.test('should allow requests within limit', async (t) => {
        const response1 = await app.inject({
            method: 'GET',
            url: '/test'
        });

        t.equal(response1.statusCode, OK_CODE, 'first request should succeed');
        t.equal(JSON.parse(response1.body).message, 'success', 'should return success message');
        
        t.ok(response1.headers['x-ratelimit-limit'], 'should include rate limit headers');
        t.ok(response1.headers['x-ratelimit-remaining'], 'should include remaining requests');
    });

    t.test('should enforce rate limit', async (t) => {
        // First 3 requests should succeed
        for (let i = 0; i < 3; i++) {
            const response = await app.inject({
                method: 'GET',
                url: '/test'
            });
            t.equal(response.statusCode, OK_CODE, `request ${i + 1} should succeed`);
        }

        // Fourth request should be rate limited
        const blockedResponse = await app.inject({
            method: 'GET',
            url: '/test'
        });
        
        const errorBody = JSON.parse(blockedResponse.body);
        t.equal(errorBody.error, RATE_LIMIT_EXCEEDED_CODE_MESSAGE, 'should return correct error code');
        t.match(errorBody.message, /Rate limit exceeded/, 'should include rate limit message');
    });

    t.test('should include correct headers', async (t) => {
        const response = await app.inject({
            method: 'GET',
            url: '/test'
        });

        const headers = response.headers;
        t.equal(headers['x-ratelimit-limit'], '3', 'should show correct limit');
        t.equal(headers['x-ratelimit-remaining'], '2', 'should show remaining requests');
        t.ok(headers['x-ratelimit-reset'], 'should include reset timestamp');
    });

    t.test('should reset after time window', async (t) => {
        // Make 3 requests to hit the limit
        for (let i = 0; i < 3; i++) {
            await app.inject({ method: 'GET', url: '/test' });
        }

        // Should be rate limited now
        const blockedResponse = await app.inject({
            method: 'GET', 
            url: '/test'
        });
        const errorBody = JSON.parse(blockedResponse.body);
        t.equal(errorBody.error, RATE_LIMIT_EXCEEDED_CODE_MESSAGE, 'should be rate limited');

        // Wait for time window to reset
        await new Promise(resolve => setTimeout(resolve, 1100));

        const resetResponse = await app.inject({
            method: 'GET',
            url: '/test' 
        });
        t.equal(resetResponse.statusCode, OK_CODE, 'should work after reset');
    });
});