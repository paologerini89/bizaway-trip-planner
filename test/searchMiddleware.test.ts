import { test } from 'tap';
import { searchMiddleware } from '../src/middleware/search';
import { BAD_REQUEST_CODE } from '../src/utils/errors';

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

// Mock FastifyRequest
const createMockRequest = (query: any = {}) => ({
    query
} as any);

test('Search middleware', async (t) => {
    t.test('should return 400 when origin parameter is missing', async (t) => {
        const request = createMockRequest({ destination: 'LAX', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Missing required query parameters: origin, destination, sort_by');
        t.ok(reply.getSentPayload().timestamp);
    });

    t.test('should return 400 when destination parameter is missing', async (t) => {
        const request = createMockRequest({ origin: 'ATL', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Missing required query parameters: origin, destination, sort_by');
    });

    t.test('should return 400 when sort_by parameter is missing', async (t) => {
        const request = createMockRequest({ origin: 'ATL', destination: 'LAX' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Missing required query parameters: origin, destination, sort_by');
    });

    t.test('should return 400 when all parameters are missing', async (t) => {
        const request = createMockRequest({});
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Missing required query parameters: origin, destination, sort_by');
    });

    t.test('should return 400 when origin is invalid IATA code', async (t) => {
        const request = createMockRequest({ origin: 'INVALID', destination: 'LAX', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Invalid origin code: INVALID. Must be a valid IATA code of a supported place.');
    });

    t.test('should return 400 when origin is too short', async (t) => {
        const request = createMockRequest({ origin: 'AT', destination: 'LAX', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Invalid origin code: AT. Must be a valid IATA code of a supported place.');
    });

    t.test('should return 400 when origin is unsupported IATA code', async (t) => {
        const request = createMockRequest({ origin: 'XYZ', destination: 'LAX', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Invalid origin code: XYZ. Must be a valid IATA code of a supported place.');
    });

    t.test('should return 400 when destination is invalid IATA code', async (t) => {
        const request = createMockRequest({ origin: 'ATL', destination: 'INVALID', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Invalid destination code: INVALID. Must be a valid IATA code of a supported place.');
    });

    t.test('should return 400 when destination is unsupported IATA code', async (t) => {
        const request = createMockRequest({ origin: 'ATL', destination: 'ABC', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, 'Invalid destination code: ABC. Must be a valid IATA code of a supported place.');
    });

    t.test('should return 400 when sort_by is invalid', async (t) => {
        const request = createMockRequest({ origin: 'ATL', destination: 'LAX', sort_by: 'invalid' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.equal(reply.getStatusCode(), BAD_REQUEST_CODE);
        t.ok(reply.getSentPayload());
        t.equal(reply.getSentPayload().error, 'Bad Request');
        t.equal(reply.getSentPayload().message, "Invalid sort_by value: invalid. Must be either 'fastest' or 'cheapest'.");
    });

    t.test('should not send response when all parameters are valid (fastest sort)', async (t) => {
        const request = createMockRequest({ origin: 'ATL', destination: 'LAX', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.notOk(reply.wasCalled(), 'should not call code() or send() for valid parameters');
    });

    t.test('should not send response when all parameters are valid (cheapest sort)', async (t) => {
        const request = createMockRequest({ origin: 'JFK', destination: 'SFO', sort_by: 'cheapest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.notOk(reply.wasCalled(), 'should not call code() or send() for valid parameters');
    });

    t.test('should handle lowercase IATA codes correctly', async (t) => {
        const request = createMockRequest({ origin: 'atl', destination: 'lax', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.notOk(reply.wasCalled(), 'should not call code() or send() for valid lowercase IATA codes');
    });

    t.test('should handle mixed case IATA codes correctly', async (t) => {
        const request = createMockRequest({ origin: 'AtL', destination: 'LaX', sort_by: 'fastest' });
        const reply = createMockReply();
        
        await searchMiddleware(request, reply);
        
        t.notOk(reply.wasCalled(), 'should not call code() or send() for valid mixed case IATA codes');
    });

    t.test('should validate all supported IATA codes', async (t) => {
        // Test a few different supported codes to ensure validation works
        const supportedCodes = ['ATL', 'PEK', 'LAX', 'DXB', 'HND', 'ORD', 'LHR', 'CDG'];
        
        for (const code of supportedCodes) {
            const request = createMockRequest({ origin: code, destination: 'LAX', sort_by: 'fastest' });
            const reply = createMockReply();
            
            await searchMiddleware(request, reply);
            
            t.notOk(reply.wasCalled(), `should not call code() or send() for valid IATA code: ${code}`);
        }
    });
});