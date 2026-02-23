import { FastifyRequest, FastifyReply } from 'fastify';
import { buildErrorResponse, UNAUTHORIZED_CODE } from '../utils/errors';

// Simple authentication middleware
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        return reply.code(UNAUTHORIZED_CODE).send(buildErrorResponse({ code: UNAUTHORIZED_CODE, message: 'Authorization header is required' }));
    }

    // Bearer token
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return reply.code(UNAUTHORIZED_CODE).send(buildErrorResponse({ code: UNAUTHORIZED_CODE, message: 'Invalid authorization format. Expected: Bearer <token>' }));
    }
}