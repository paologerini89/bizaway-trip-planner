import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SaveTripDBRequestSchema,
  SaveTripDBResponseSchema,
  TripsDBListResponseSchema,
  DeleteTripDBResponseSchema,
  SaveTripDBRequest,
  DeleteTripDBParams,
  GetTripDBParams,
  GetTripDBResponseSchema
} from '../types/tripManager';
import { GenericErrorResponseSchemas } from '../types/errors';
import { TripStore } from '../services/tripStore';
import { authMiddleware } from '../middleware/auth';
import { OK_CODE, CREATED_CODE } from '../utils/common';
import { buildErrorResponse, NOT_FOUND_CODE } from '../utils/errors';

interface TripManagerRouteOptions {
	tripStore: TripStore;
}

export async function tripManagerRoutes(fastify: FastifyInstance, options: TripManagerRouteOptions) {
	const { tripStore } = options;

	/**
	 * @route POST /trips
	 * @bodyparam {string} id - Unique trip ID from the external API
	 * @bodyparam {string} origin - IATA code of the origin airport
	 * @bodyparam {string} destination - IATA code of the destination airport
	 * @bodyparam {number} cost - Total price of the trip
	 * @bodyparam {number} duration - Total duration of the trip in minutes
	 * @bodyparam {string} type - Type of the trip (e.g., 'flight', 'train', 'bus')
	 * @bodyparam {string} display_name - Display name of the trip
	 * 
	 * Save a trip in DB
	 */
	fastify.post<{
		Body: SaveTripDBRequest
	}>('/trips', {
		preHandler: [authMiddleware],
		schema: {
			body: SaveTripDBRequestSchema,
			response: {
				...GenericErrorResponseSchemas,
				[CREATED_CODE]: SaveTripDBResponseSchema,
			}
		}
	}, async (request: FastifyRequest<{ Body: SaveTripDBRequest }>, reply: FastifyReply) => {
		const trip = request.body;

		const tripDB = tripStore.saveTripDB(trip);

		return reply.code(CREATED_CODE).send({
			success: true,
			message: 'Trip saved successfully',
			trip: tripDB
		});
	});

	/**
	 * @route GET /trips
	 * 
	 * Get all saved trips
	 */
	fastify.get('/trips', {
		preHandler: [authMiddleware],
		schema: {
			response: {
				...GenericErrorResponseSchemas,
				[OK_CODE]: TripsDBListResponseSchema
			}
		}
	}, async (request: FastifyRequest, reply: FastifyReply) => {
		const tripsDB = tripStore.getAllTripsDB();

		return reply.code(OK_CODE).send({
			trips: tripsDB,
			total: tripsDB.length
		});
	});

	/**
	 * @route DELETE /trips/:id
	 * @param {string} id - ID of the trip to delete
	 * 
	 * Delete a saved trip
	 */
	fastify.delete<{
		Params: DeleteTripDBParams
	}>('/trips/:id', {
		preHandler: [authMiddleware],
		schema: {
			params: {
				type: 'object',
				properties: {
					id: { type: 'string' }
				},
				required: ['id']
			},
			response: {
				...GenericErrorResponseSchemas,
				[OK_CODE]: DeleteTripDBResponseSchema
			}
		}
	}, async (request: FastifyRequest<{ Params: DeleteTripDBParams }>, reply: FastifyReply) => {
		const { id } = request.params;

		const deleted = tripStore.deleteTripDB(id);

		if (!deleted) {
			return reply.code(NOT_FOUND_CODE).send(buildErrorResponse({ code: NOT_FOUND_CODE, message: 'Trip not found' }));
		}

		return reply.code(OK_CODE).send({
			success: true,
			message: 'Trip deleted successfully'
		});
	});

	/**
	 * @route GET /trips/:id
	 * @param {string} id - ID of the trip to retrieve
	 * 
	 * Get a specific saved trip
	 */
	fastify.get<{
		Params: GetTripDBParams
	}>('/trips/:id', {
		preHandler: [authMiddleware],
		schema: {
			params: {
				type: 'object',
				properties: {
					id: { type: 'string' }
				},
				required: ['id']
			},
			response: {
				...GenericErrorResponseSchemas,
				[OK_CODE]: GetTripDBResponseSchema,
			}
		}
	}, async (request: FastifyRequest<{ Params: GetTripDBParams }>, reply: FastifyReply) => {
		const { id } = request.params;

		const tripDB = tripStore.getTripDBById(id);

		if (!tripDB) {
			return reply.code(NOT_FOUND_CODE).send(buildErrorResponse({ code: NOT_FOUND_CODE, message: 'Trip not found' }));
		}

		return reply.code(OK_CODE).send({
			success: true,
			message: 'Trip retrieved successfully',
			trip: tripDB
		});
	});
}