import { test } from 'tap';
import {
    BAD_REQUEST_CODE,
    BAD_REQUEST_CODE_MESSAGE,
    BAD_REQUEST_ERROR_MESSAGE,
    UNAUTHORIZED_CODE,
    UNAUTHORIZED_CODE_MESSAGE,
    UNAUTHORIZED_ERROR_MESSAGE,
    NOT_FOUND_CODE,
    NOT_FOUND_CODE_MESSAGE,
    NOT_FOUND_ERROR_MESSAGE,
    CONFLICT_CODE,
    CONFLICT_CODE_MESSAGE,
    CONFLICT_ERROR_MESSAGE,
    INTERNAL_SERVER_ERROR_CODE,
    INTERNAL_SERVER_ERROR_CODE_MESSAGE,
    INTERNAL_SERVER_ERROR_ERROR_MESSAGE,
    buildErrorResponse,
    RATE_LIMIT_EXCEEDED_ERROR_MESSAGE,
    RATE_LIMIT_EXCEEDED_CODE_MESSAGE,
    RATE_LIMIT_EXCEEDED_CODE,
    SERVICE_UNAVAILABLE_ERROR_MESSAGE,
    SERVICE_UNAVAILABLE_CODE_MESSAGE,
    SERVICE_UNAVAILABLE_CODE
} from '../src/utils/errors';

test('Error constants', async (t) => {
    t.test('Bad Request errors', async (t) => {
        t.equal(BAD_REQUEST_CODE, 400, 'should have correct status code');
        t.equal(BAD_REQUEST_CODE_MESSAGE, 'Bad Request', 'should have correct message');
        t.equal(BAD_REQUEST_ERROR_MESSAGE, 'Invalid input parameters', 'should have correct error message');
    });

    t.test('Unauthorized errors', async (t) => {
        t.equal(UNAUTHORIZED_CODE, 401, 'should have correct status code');
        t.equal(UNAUTHORIZED_CODE_MESSAGE, 'Unauthorized', 'should have correct message');
        t.equal(UNAUTHORIZED_ERROR_MESSAGE, 'Authorization header is required and must be valid', 'should have correct error message');
    });

    t.test('Not Found errors', async (t) => {
        t.equal(NOT_FOUND_CODE, 404, 'should have correct status code');
        t.equal(NOT_FOUND_CODE_MESSAGE, 'Not Found', 'should have correct message');
        t.equal(NOT_FOUND_ERROR_MESSAGE, 'The requested resource was not found', 'should have correct error message');
    });

    t.test('Conflict errors', async (t) => {
        t.equal(CONFLICT_CODE, 409, 'should have correct status code');
        t.equal(CONFLICT_CODE_MESSAGE, 'Conflict', 'should have correct message');
        t.equal(CONFLICT_ERROR_MESSAGE, 'The resource already exists', 'should have correct error message');
    });

    t.test('Rate Limit Exceeded errors', async (t) => {
        t.equal(RATE_LIMIT_EXCEEDED_CODE, 429, 'should have correct status code');
        t.equal(RATE_LIMIT_EXCEEDED_CODE_MESSAGE, 'Too Many Requests', 'should have correct message');
        t.equal(RATE_LIMIT_EXCEEDED_ERROR_MESSAGE, 'Rate limit exceeded. Please try again later.', 'should have correct error message');
    });

    t.test('Internal Server Error', async (t) => {
        t.equal(INTERNAL_SERVER_ERROR_CODE, 500, 'should have correct status code');
        t.equal(INTERNAL_SERVER_ERROR_CODE_MESSAGE, 'Internal Server Error', 'should have correct message');
        t.equal(INTERNAL_SERVER_ERROR_ERROR_MESSAGE, 'An unexpected error occurred', 'should have correct error message');
    });

    t.test('Service Unavailable Error', async (t) => {
        t.equal(SERVICE_UNAVAILABLE_CODE, 503, 'should have correct status code');
        t.equal(SERVICE_UNAVAILABLE_CODE_MESSAGE, 'Service Unavailable', 'should have correct message');
        t.equal(SERVICE_UNAVAILABLE_ERROR_MESSAGE, 'Unable to reach the API', 'should have correct error message');
    });
});

test('buildErrorResponse function', async (t) => {
    t.test('should build correct error response for known code', async (t) => {
        const response = buildErrorResponse({ code: BAD_REQUEST_CODE });
        t.equal(response.error, BAD_REQUEST_CODE_MESSAGE, 'should have correct error message');
        t.equal(response.message, BAD_REQUEST_ERROR_MESSAGE, 'should have correct error description');
    });

    t.test('should build correct error response for unknown code', async (t) => {
        const response = buildErrorResponse({ code: 999 });
        t.equal(response.error, 'Unknown Error', 'should have default error message for unknown code');
        t.equal(response.message, 'An unexpected error occurred', 'should have default error description for unknown code');
    });

    t.test('should use custom message if provided', async (t) => {
        const customMessage = 'Custom error message';
        const response = buildErrorResponse({ code: BAD_REQUEST_CODE, message: customMessage });
        t.equal(response.error, BAD_REQUEST_CODE_MESSAGE, 'should have correct error message');
        t.equal(response.message, customMessage, 'should use custom error description');
    });

    t.test('should use error message from Error object if provided', async (t) => {
        const error = new Error('Error object message');
        const response = buildErrorResponse({ code: BAD_REQUEST_CODE, error });
        t.equal(response.error, BAD_REQUEST_CODE_MESSAGE, 'should have correct error message');
        t.equal(response.message, error.message, 'should use message from Error object');
    });
});