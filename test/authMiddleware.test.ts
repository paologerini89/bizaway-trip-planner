import { test } from 'tap';
import { authMiddleware } from '../src/middleware/auth';
import { UNAUTHORIZED_CODE } from '../src/utils/errors';

// Mock FastifyReply che simula correttamente il comportamento di Fastify
const createMockReply = () => {
    let currentStatusCode: number | null = null;
    let sentPayload: any = null;

    const mockReply = {
        code: (statusCode: number) => {
            currentStatusCode = statusCode;
            return mockReply; // Importante per il method chaining
        },
        send: (payload: any) => {
            sentPayload = payload;
            return mockReply;
        },
        getStatusCode: () => currentStatusCode,
        getSentPayload: () => sentPayload,
        wasCalled: () => currentStatusCode !== null || sentPayload !== null
    } as any;
    
    return mockReply;
};

const createMockRequest = (authHeader?: string) => ({
    headers: {
        ...(authHeader && { authorization: authHeader })
    }
} as any);

test('Auth middleware', async (t) => {
    t.test('should return 401 when authorization header is missing', async (t) => {
        const request = createMockRequest();
        const reply = createMockReply();
        
        await authMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), UNAUTHORIZED_CODE, 'should set correct status code');
        t.ok(reply.getSentPayload(), 'should send a response payload');
        t.equal(reply.getSentPayload().error, 'Unauthorized');
        t.equal(reply.getSentPayload().message, 'Authorization header is required');
        t.ok(reply.getSentPayload().timestamp);
    });

    t.test('should return 401 when authorization header format is invalid (not Bearer)', async (t) => {
        const request = createMockRequest('Basic sometoken');
        const reply = createMockReply();
        
        await authMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), UNAUTHORIZED_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Unauthorized');
        t.equal(reply.getSentPayload().message, 'Invalid authorization format. Expected: Bearer <token>');
    });

    t.test('should return 401 when Bearer token is missing', async (t) => {
        const request = createMockRequest('Bearer');
        const reply = createMockReply();
        
        await authMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), UNAUTHORIZED_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Unauthorized');
        t.equal(reply.getSentPayload().message, 'Invalid authorization format. Expected: Bearer <token>');
    });

    t.test('should return 401 when Bearer token is empty', async (t) => {
        const request = createMockRequest('Bearer ');
        const reply = createMockReply();
        
        await authMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), UNAUTHORIZED_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Unauthorized');
        t.equal(reply.getSentPayload().message, 'Invalid authorization format. Expected: Bearer <token>');
    });

    t.test('should return 401 when Bearer token is only whitespace', async (t) => {
        const request = createMockRequest('Bearer    ');
        const reply = createMockReply();
        
        await authMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), UNAUTHORIZED_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Unauthorized');
        t.equal(reply.getSentPayload().message, 'Invalid authorization format. Expected: Bearer <token>');
    });

    t.test('should not send response when valid Bearer token is provided', async (t) => {
        const request = createMockRequest('Bearer validtoken123');
        const reply = createMockReply();
        
        await authMiddleware(request, reply);
        
        t.notOk(reply.wasCalled(), 'should not call code() or send() for valid token');
        t.equal(reply.getSentPayload(), null, 'should not send any payload for valid token');
        t.equal(reply.getStatusCode(), null, 'should not set status code for valid token');
    });

    t.test('should not send response when valid Bearer token with special characters is provided', async (t) => {
        const request = createMockRequest('Bearer valid-token_123.jwt');
        const reply = createMockReply();
        
        await authMiddleware(request, reply);
        
        t.notOk(reply.wasCalled(), 'should not call code() or send() for valid token');
    });

    t.test('should handle malformed authorization header gracefully', async (t) => {
        const request = createMockRequest('InvalidFormat');
        const reply = createMockReply();
        
        await authMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), UNAUTHORIZED_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Unauthorized');
        t.equal(reply.getSentPayload().message, 'Invalid authorization format. Expected: Bearer <token>');
    });
});