import { Response, Request, NextFunction } from "express";
import { errorHandler } from "./errorHandler";
import { BadRequestError, InternalServerError } from "../helpers/apiError";

describe("errorHandler middleware", () => {
    const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    it("should handle ApiError with statusCode", async () => {
        const err = new BadRequestError("Something went wrong");

        await errorHandler(err, {} as Request, res as Response, {} as NextFunction);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: err.message });
    });

    it("should handle generic Error without statusCode", async () => {
        const err = new Error("Unexpected failure");
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await errorHandler(err, {} as Request, res as Response, {} as NextFunction);

        expect(consoleSpy).toHaveBeenCalledWith(err);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "internal server error." });

        consoleSpy.mockRestore();
    });
});
