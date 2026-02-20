export const BAD_REQUEST_CODE = 400;
export const BAD_REQUEST_CODE_MESSAGE = 'Bad Request';
export const BAD_REQUEST_ERROR_MESSAGE = 'Invalid input parameters';

export const UNAUTHORIZED_CODE = 401;
export const UNAUTHORIZED_CODE_MESSAGE = 'Unauthorized';
export const UNAUTHORIZED_ERROR_MESSAGE = 'Authorization header is required and must be valid';

export const INTERNAL_SERVER_ERROR_CODE = 500;
export const INTERNAL_SERVER_ERROR_CODE_MESSAGE = 'Internal Server Error';
export const INTERNAL_SERVER_ERROR_MESSAGE = 'An unexpected error occurred';


const errors: Record<number, { error: string; message: string }> = {
    [BAD_REQUEST_CODE]: {
        error: BAD_REQUEST_CODE_MESSAGE,
        message: BAD_REQUEST_ERROR_MESSAGE
    },
    [UNAUTHORIZED_CODE]: {
        error: UNAUTHORIZED_CODE_MESSAGE,
        message: UNAUTHORIZED_ERROR_MESSAGE
    },
    [INTERNAL_SERVER_ERROR_CODE]: {
        error: INTERNAL_SERVER_ERROR_CODE_MESSAGE,
        message: INTERNAL_SERVER_ERROR_MESSAGE
    }
}

export const buildErrorResponse = ({ code, error = null, defaultMessage = '' }: { code: number, error?: any, defaultMessage?: string }) => {
    const errorCodeMessage = errors[code]?.error || 'Unknown Error';
    const errorMessage = defaultMessage || errors[code]?.message || 'An unexpected error occurred';
    return {
        error: errorCodeMessage,
        message: error instanceof Error ? error.message || errorMessage : errorMessage,
        timestamp: new Date().toISOString()
    };
}