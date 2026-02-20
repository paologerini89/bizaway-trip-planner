import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
    SearchRequestSchema, 
    SearchResponseSchema,
    SearchRequest,
} from '../types/trips';
import { TripService } from '../services/tripService';
import { authMiddleware } from '../middleware/auth';
import { BadRequestResponseSchema, InternalServerErrorResponseSchema, UnauthorizedResponseSchema } from '../types/errors';
import { BAD_REQUEST_CODE, buildErrorResponse, INTERNAL_SERVER_ERROR_CODE } from '../utils/errors';
import { OK_CODE } from '../utils/common';

interface TripRouteOptions {
    tripService: TripService;
}

export async function tripRoutes(fastify: FastifyInstance, options: TripRouteOptions) {
    const { tripService } = options;

    /**
     * @route GET /trips/search
     * @queryparam {string} origin - IATA code of the origin airport (3 letters)
     * @queryparam {string} destination - IATA code of the destination airport (3 letters)
     * @queryparam {string} sort_by - Sorting strategy: 'fastest' or 'cheapest'
     */

    fastify.get<{
        Querystring: SearchRequest
    }>('/trips/search', {
        preHandler: [authMiddleware, async (request, reply) => {
            const { origin, destination, sort_by } = request.query;
            if (!origin || !destination || !sort_by) {
                const message = 'Missing required query parameters: origin, destination, sort_by';
                return reply.code(BAD_REQUEST_CODE).send(buildErrorResponse({ code: BAD_REQUEST_CODE, defaultMessage: message }));
            }
        }],
        schema: {
            querystring: SearchRequestSchema,
            response: {
                200: SearchResponseSchema,
                400: BadRequestResponseSchema,
                401: UnauthorizedResponseSchema,
                500: InternalServerErrorResponseSchema,
            }
        }
    }, async (request: FastifyRequest<{ Querystring: SearchRequest }>, reply: FastifyReply) => {
        try {
            const { origin, destination, sort_by } = request.query;

            console.log(`Received search request: origin=${origin}, destination=${destination}, sort_by=${sort_by}`);

            const trips = await tripService.searchTrips(origin, destination, sort_by);

            return reply.code(OK_CODE).send({
                trips,
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                sort_by,
                total_results: trips.length
            });
        } catch (error: any) {
            const defaultMessage = 'Failed to search trips';
            return reply.code(INTERNAL_SERVER_ERROR_CODE).send(buildErrorResponse({ code: INTERNAL_SERVER_ERROR_CODE, error, defaultMessage }));
        }
    });
}