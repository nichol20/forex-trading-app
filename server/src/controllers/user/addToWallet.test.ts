import { Request, Response } from "express";

import { addToWallet } from "./addToWallet";
import { BadRequestError, InternalServerError } from "../../helpers/apiError";
import { validUser } from "../../../jest.setup-env";
import { findUserByEmail } from "../../repositories/userRepository";
import { createDealWithContactAssociation } from "../../services/hubspotApi";

jest.mock("../../services/hubspotApi", () => ({
    createDealWithContactAssociation: jest.fn()
}))

const mockRequest = (body: any, userId: string): Partial<Request> => ({
    body,
    userId,
});
const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("addToWallet controller", () => {
    it("should throw BadRequestError if validation fails", async () => {
        const req = mockRequest(
            { amount: -50, currency: "INVALID" },
            validUser.id
        ) as Request;
        const res = mockResponse() as Response;

        await expect(addToWallet(req, res)).rejects.toThrow(BadRequestError);
    });

    it("should update wallet and respond with updated wallet", async () => {
        const user = await findUserByEmail(validUser.email)
        expect(user).not.toBeFalsy();

        const req = mockRequest(
            { amount: 100, currency: "USD" },
            validUser.id
        ) as Request;
        const res = mockResponse() as Response;

        await addToWallet(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            USD: user!.wallet.USD + 100,
            GBP: user!.wallet.GBP,
        });
    });
});
