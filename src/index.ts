import Fastify from 'fastify';
import { config } from 'dotenv';
import cors from '@fastify/cors';
import { tripRoutes } from './routes/trips';
import { tripManagerRoutes } from './routes/tripManager';
import { TripService } from './services/tripService';
import { TripStore } from './services/tripStore';
import { buildErrorResponse, INTERNAL_SERVER_ERROR_CODE, SERVICE_UNAVAILABLE_CODE } from './utils/errors';

config();

const fastify = Fastify({
    logger: true
});

fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.setErrorHandler((error: any, request, reply) => {
    fastify.log.error(error);
    
	// da axios
    if (error.response) {
        const code = error.response.status;
        const responseMessage = error.response.data?.msg || error.response.data?.error || '';

		const errorResponse = buildErrorResponse({ code, message: responseMessage });
        
        return reply.status(code).send(errorResponse);
    }
    
    if (error.request) {
		return reply.status(SERVICE_UNAVAILABLE_CODE).send(buildErrorResponse({ code: SERVICE_UNAVAILABLE_CODE }));
    }
    
    return reply.status(INTERNAL_SERVER_ERROR_CODE).send(buildErrorResponse({ code: INTERNAL_SERVER_ERROR_CODE, error }));

});

const apiUrl = process.env.TRIPS_API_ENDPOINT;
if (!apiUrl) {
	fastify.log.error('TRIPS_API_ENDPOINT environment variable is required');
	process.exit(1);
}

const apiKey = process.env.TRIPS_API_KEY;
if (!apiKey) {
	fastify.log.error('TRIPS_API_KEY environment variable is required');
	process.exit(1);
}

const tripService = new TripService(apiUrl, apiKey);
const tripStore = new TripStore();

// Health check endpoint
fastify.get('/health', async (request, reply) => {
	return {
		status: 'ok',
		timestamp: new Date().toISOString(),
		version: '1.0.0',
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || 'development'
	};
});

// Register routes
fastify.register(tripRoutes, { tripService });
fastify.register(tripManagerRoutes, { tripStore });

const startServer = async (): Promise<void> => {
	try {
		const port = parseInt(process.env.PORT || '3000', 10);
		const host = process.env.HOST || '0.0.0.0';
		
		await fastify.listen({ port, host });
		fastify.log.info(`Server running on http://${host}:${port}`);
	} catch (error) {
		fastify.log.error(error);
		process.exit(1);
	}
};

startServer();