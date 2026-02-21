import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
    SearchRequestSchema, 
    SearchResponseSchema,
    SearchRequest,
} from '../types/trips';
import { TripService } from '../services/tripService';
import { authMiddleware } from '../middleware/auth';
import { GenericErrorResponseSchemas } from '../types/errors';
import { OK_CODE } from '../utils/common';
import { searchMiddleware } from '../middleware/search';

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
        preHandler: [authMiddleware, searchMiddleware],
        schema: {
            querystring: SearchRequestSchema,
            response: {
                ...GenericErrorResponseSchemas,
                200: SearchResponseSchema,
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
            fastify.log.error('Error searching trips:', error);
            throw error;
        }
    });
}