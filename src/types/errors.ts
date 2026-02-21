import { Type, Static } from '@sinclair/typebox';
import { BAD_REQUEST_CODE, BAD_REQUEST_CODE_MESSAGE, CONFLICT_CODE, CONFLICT_CODE_MESSAGE, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_CODE_MESSAGE, NOT_FOUND_CODE, NOT_FOUND_CODE_MESSAGE, SERVICE_UNAVAILABLE_CODE, SERVICE_UNAVAILABLE_CODE_MESSAGE, UNAUTHORIZED_CODE, UNAUTHORIZED_CODE_MESSAGE } from '../utils/errors';

// Generic error response schema
export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  timestamp: Type.String()
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

export const BadRequestResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(BAD_REQUEST_CODE_MESSAGE)
});

export type BadRequestResponse = Static<typeof BadRequestResponseSchema>;

export const UnauthorizedResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(UNAUTHORIZED_CODE_MESSAGE)
});

export type UnauthorizedResponse = Static<typeof UnauthorizedResponseSchema>;

export const NotFoundResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(NOT_FOUND_CODE_MESSAGE)
});

export type NotFoundResponse = Static<typeof NotFoundResponseSchema>;

export const ConflictResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(CONFLICT_CODE_MESSAGE)
});

export type ConflictResponse = Static<typeof ConflictResponseSchema>;

export const InternalServerErrorResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(INTERNAL_SERVER_ERROR_CODE_MESSAGE)
});

export type InternalServerErrorResponse = Static<typeof InternalServerErrorResponseSchema>;

export const ServiceUnavailableResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(SERVICE_UNAVAILABLE_CODE_MESSAGE)
});

export type ServiceUnavailableResponse = Static<typeof ServiceUnavailableResponseSchema>;

export const GenericErrorResponseSchemas = {
        [BAD_REQUEST_CODE]: BadRequestResponseSchema,
        [UNAUTHORIZED_CODE]: UnauthorizedResponseSchema,
        [NOT_FOUND_CODE]: NotFoundResponseSchema,
        [CONFLICT_CODE]: ConflictResponseSchema,
        [INTERNAL_SERVER_ERROR_CODE]: InternalServerErrorResponseSchema,
        [SERVICE_UNAVAILABLE_CODE]: ServiceUnavailableResponseSchema
};
