export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return {
      error: error.message,
      status: error.statusCode,
    };
  }

  return {
    error: 'Internal server error',
    status: 500,
  };
}
