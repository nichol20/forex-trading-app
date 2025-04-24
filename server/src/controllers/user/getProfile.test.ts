import { Request, Response } from "express";

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
        const req = mockRequest("507f1f77bcf86cd799439011") as Request;
        const res = mockResponse() as Response;

        await expect(getProfile(req, res)).rejects.toThrow(InternalServerError);
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
