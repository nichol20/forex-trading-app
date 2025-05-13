import { Request, Response } from "express";
import { randomUUID } from "crypto";

import { getProfile } from "./getProfile";
import { InternalServerError } from "../../helpers/apiError";
import { validUser } from "../../../jest.setup-env";

const mockRequest = (userId: string): Partial<Request> => ({
    userId,
});
const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("getProfile controller", () => {
    it("should throw InternalServerError if user is not found", async () => {
        const req = mockRequest(randomUUID()) as Request;
        const res = mockResponse() as Response;
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await expect(getProfile(req, res)).rejects.toThrow(InternalServerError);
        expect(consoleSpy).toHaveBeenCalledWith("error finding authenticated user");
    });

    it("should return user profile data without password", async () => {
        const req = mockRequest(validUser.id) as Request;
        const res = mockResponse() as Response;

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                id: validUser.id,
                email: validUser.email,
                name: validUser.name,
            })
        );

        // Make sure password is not in the response
        const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
        expect(jsonCall.password).toBeUndefined();
    });
});
