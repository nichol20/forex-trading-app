export class ApiError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string) {
        super(message, 401);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string) {
        super(message, 403);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class ConflictError extends ApiError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class InternalServerError extends ApiError {
    constructor() {
        super("internal server error", 500);
    }
}
