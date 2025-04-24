import { Request, Response } from "express";

import { getHistory } from "./getHistory";
import { validExchangeHistory, validUser } from "../../../jest.setup-env";

const mockRequest = (userId: string): Partial<Request> => ({
    userId,
});
const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("getHistory controller", () => {
    it("should fetch and return exchange history for the user", async () => {
        const req = mockRequest(validUser.id) as Request;
        const res = mockResponse() as Response;

        await getHistory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(validExchangeHistory);
    });
});
