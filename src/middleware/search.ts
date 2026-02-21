import { FastifyRequest, FastifyReply } from "fastify";
import { SearchRequest, isValidPlaceCode } from "../types/trips";
import { BAD_REQUEST_CODE, buildErrorResponse } from "../utils/errors";

export async function searchMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const { origin, destination, sort_by } = request.query as SearchRequest;
    if (!origin || !destination || !sort_by) {
        const message = 'Missing required query parameters: origin, destination, sort_by';
        return reply.code(BAD_REQUEST_CODE).send(buildErrorResponse({ code: BAD_REQUEST_CODE, message }));
    }
    if (!isValidPlaceCode(origin)) {
        const message = `Invalid origin code: ${origin}. Must be a valid IATA code of a supported place.`;
        return reply.code(BAD_REQUEST_CODE).send(buildErrorResponse({ code: BAD_REQUEST_CODE, message }));
    }
    if (!isValidPlaceCode(destination)) {
        const message = `Invalid destination code: ${destination}. Must be a valid IATA code of a supported place.`;
        return reply.code(BAD_REQUEST_CODE).send(buildErrorResponse({ code: BAD_REQUEST_CODE, message }));
    }
    if (sort_by !== 'fastest' && sort_by !== 'cheapest') {
        const message = `Invalid sort_by value: ${sort_by}. Must be either 'fastest' or 'cheapest'.`;
        return reply.code(BAD_REQUEST_CODE).send(buildErrorResponse({ code: BAD_REQUEST_CODE, message }));
    }
}