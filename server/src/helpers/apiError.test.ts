import {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
} from "./apiError";

describe("ApiError subclasses", () => {
    it("BadRequestError should have correct properties", () => {
        const err = new BadRequestError("Bad request");
        expect(err).toBeInstanceOf(ApiError);
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Bad request");
        expect(err.statusCode).toBe(400);
        expect(err.name).toBe("BadRequestError");
    });

    it("UnauthorizedError should have correct properties", () => {
        const err = new UnauthorizedError("Unauthorized");
        expect(err.statusCode).toBe(401);
        expect(err.name).toBe("UnauthorizedError");
    });

    it("ForbiddenError should have correct properties", () => {
        const err = new ForbiddenError("Forbidden");
        expect(err.statusCode).toBe(403);
        expect(err.name).toBe("ForbiddenError");
    });

    it("NotFoundError should have correct properties", () => {
        const err = new NotFoundError("Not found");
        expect(err.statusCode).toBe(404);
        expect(err.name).toBe("NotFoundError");
    });

    it("ConflictError should have correct properties", () => {
        const err = new ConflictError("Conflict");
        expect(err.statusCode).toBe(409);
        expect(err.name).toBe("ConflictError");
    });

    it("InternalServerError should have default message and statusCode", () => {
        const err = new InternalServerError();
        expect(err.message).toBe("internal server error");
        expect(err.statusCode).toBe(500);
        expect(err.name).toBe("InternalServerError");
    });
});
