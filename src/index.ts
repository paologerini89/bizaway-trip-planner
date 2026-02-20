import Fastify from 'fastify';
import { config } from 'dotenv';
import cors from '@fastify/cors';
import { tripRoutes } from './routes/trips';
import { TripService } from './services/tripService';

config();

const fastify = Fastify({
    logger: true
});

fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.setErrorHandler((error: Error, request, reply) => {
    fastify.log.error(error);
    reply.status(500).send({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

const apiUrl = process.env.TRIPS_API_ENDPOINT;
if (!apiUrl) {
	console.error('TRIPS_API_ENDPOINT environment variable is required');
	process.exit(1);
}

const apiKey = process.env.TRIPS_API_KEY;
if (!apiKey) {
	console.error('TRIPS_API_KEY environment variable is required');
	process.exit(1);
}

const tripService = new TripService(apiUrl, apiKey);

// Register routes
fastify.register(tripRoutes, { tripService });

// Health check endpoint (non richiede autenticazione)
fastify.get('/health', async (request, reply) => {
	return reply.send({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		version: '1.0.0',
		authentication: 'enabled'
	});
});

const start = async (): Promise<void> => {
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

// Start the server
start();