export const BAD_REQUEST_CODE = 400;
export const BAD_REQUEST_CODE_MESSAGE = 'Bad Request';
export const BAD_REQUEST_ERROR_MESSAGE = 'Invalid input parameters';

export const UNAUTHORIZED_CODE = 401;
export const UNAUTHORIZED_CODE_MESSAGE = 'Unauthorized';
export const UNAUTHORIZED_ERROR_MESSAGE = 'Authorization header is required and must be valid';

export const NOT_FOUND_CODE = 404;
export const NOT_FOUND_CODE_MESSAGE = 'Not Found';
export const NOT_FOUND_ERROR_MESSAGE = 'The requested resource was not found';

export const CONFLICT_CODE = 409;
export const CONFLICT_CODE_MESSAGE = 'Conflict';
export const CONFLICT_ERROR_MESSAGE = 'The resource already exists';

export const INTERNAL_SERVER_ERROR_CODE = 500;
export const INTERNAL_SERVER_ERROR_CODE_MESSAGE = 'Internal Server Error';
export const INTERNAL_SERVER_ERROR_ERROR_MESSAGE = 'An unexpected error occurred';

export const SERVICE_UNAVAILABLE_CODE = 503;
export const SERVICE_UNAVAILABLE_CODE_MESSAGE = 'Service Unavailable';
export const SERVICE_UNAVAILABLE_ERROR_MESSAGE = 'Unable to reach the API';

export const DEFAULT_ERROR_CODE_MESSAGE = 'Unknown Error';
export const DEFAULT_ERROR_ERROR_MESSAGE = 'An unexpected error occurred';

const errors: Record<number, { error: string; message: string }> = {
    [BAD_REQUEST_CODE]: {
        error: BAD_REQUEST_CODE_MESSAGE,
        message: BAD_REQUEST_ERROR_MESSAGE
    },
    [UNAUTHORIZED_CODE]: {
        error: UNAUTHORIZED_CODE_MESSAGE,
        message: UNAUTHORIZED_ERROR_MESSAGE
    },
    [NOT_FOUND_CODE]: {
        error: NOT_FOUND_CODE_MESSAGE,
        message: NOT_FOUND_ERROR_MESSAGE
    },
    [CONFLICT_CODE]: {
        error: CONFLICT_CODE_MESSAGE,
        message: CONFLICT_ERROR_MESSAGE
    },
    [INTERNAL_SERVER_ERROR_CODE]: {
        error: INTERNAL_SERVER_ERROR_CODE_MESSAGE,
        message: INTERNAL_SERVER_ERROR_ERROR_MESSAGE
    },
    [SERVICE_UNAVAILABLE_CODE]: {
        error: SERVICE_UNAVAILABLE_CODE_MESSAGE,
        message: SERVICE_UNAVAILABLE_ERROR_MESSAGE
    }
}

export const buildErrorResponse = ({ code, error = null, message = '' }: { code: number, error?: any, message?: string }) => {
    const errorCodeMessage = errors[code]?.error || DEFAULT_ERROR_CODE_MESSAGE;
    const errorMessage = message || errors[code]?.message || DEFAULT_ERROR_ERROR_MESSAGE;
    let returnErrorMessage = '';
    if (error instanceof Error) {
        returnErrorMessage = error.message;
    }
    if (returnErrorMessage === '') {
        returnErrorMessage = errorMessage;
    }
    return {
        error: errorCodeMessage,
        message: returnErrorMessage,
        timestamp: new Date().toISOString()
    };
}