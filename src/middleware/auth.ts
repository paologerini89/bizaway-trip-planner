import { FastifyRequest, FastifyReply } from 'fastify';
import { buildErrorResponse, UNAUTHORIZED_CODE } from '../utils/errors';

// Simple authentication middleware
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {

    /**
     * JUST IN CASE
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        return reply.code(UNAUTHORIZED_CODE).send(buildErrorResponse({ code: UNAUTHORIZED_CODE, defaultMessage: 'Authorization header is required' }));
    }

    // Bearer token
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return reply.code(UNAUTHORIZED_CODE).send(buildErrorResponse({ code: UNAUTHORIZED_CODE, defaultMessage: 'Invalid authorization format. Expected: Bearer <token>' }));
    }

    // Simple check: the token must exist and be non-empty
    if (token.trim().length === 0) {
        return reply.code(UNAUTHORIZED_CODE).send(buildErrorResponse({ code: UNAUTHORIZED_CODE, defaultMessage: 'Invalid token' }));
    }
    */
}