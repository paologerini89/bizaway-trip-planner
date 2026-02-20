import { Type, Static } from '@sinclair/typebox';
import { BAD_REQUEST_CODE_MESSAGE, INTERNAL_SERVER_ERROR_CODE_MESSAGE, UNAUTHORIZED_CODE_MESSAGE } from '../utils/errors';

// Generic error response schema
export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  timestamp: Type.String()
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

// Bad request response schema extends generic error response with specific error "Bad Request"
export const BadRequestResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(BAD_REQUEST_CODE_MESSAGE)
});

export type BadRequestResponse = Static<typeof BadRequestResponseSchema>;

// Unauthorized response schema extends generic error response with specific error "Unauthorized"
export const UnauthorizedResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(UNAUTHORIZED_CODE_MESSAGE)
});

export type UnauthorizedResponse = Static<typeof UnauthorizedResponseSchema>;

// Internal server error response schema extends generic error response with specific error "Internal Server Error"
export const InternalServerErrorResponseSchema = Type.Object({
  ...ErrorResponseSchema.properties,
  error: Type.Literal(INTERNAL_SERVER_ERROR_CODE_MESSAGE)
});

export type InternalServerErrorResponse = Static<typeof InternalServerErrorResponseSchema>;