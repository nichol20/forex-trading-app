import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { mustBeAuthenticated } from "./mustBeAuthenticated";
import { UnauthorizedError, ForbiddenError } from "../helpers/apiError";

jest.mock("jsonwebtoken");

const mockRequest = (jwtToken?: string): Partial<Request> => ({
    cookies: jwtToken ? { jwt: jwtToken } : undefined,
});

const mockResponse = (): Partial<Response> => ({});
const mockNext = jest.fn();

describe("mustBeAuthenticated middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should throw UnauthorizedError if no JWT token is provided", () => {
        const req = mockRequest() as Request;
        const res = mockResponse() as Response;

        mustBeAuthenticated(req, res, mockNext as NextFunction);

        expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("should throw ForbiddenError if JWT is invalid", () => {
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });

        const req = mockRequest("invalid.token") as Request;
        const res = mockResponse() as Response;

        mustBeAuthenticated(req, res, mockNext as NextFunction);

        expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it("should call next and set req.userId if JWT is valid", () => {
        (jwt.verify as jest.Mock).mockReturnValue({ sub: "12345" });

        const req = mockRequest("valid.token") as Request;
        const res = mockResponse() as Response;

        mustBeAuthenticated(req, res, mockNext as NextFunction);

        expect(req.userId).toBe("12345");
        expect(mockNext).toHaveBeenCalledWith();
    });
});
