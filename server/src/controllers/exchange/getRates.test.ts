import { getRates } from "./getRates";
import { fetchExchangeRate } from "../../utils/exchangeRateApi";
import { Request, Response } from "express";
import { BadRequestError } from "../../helpers/apiError";

jest.mock("../../utils/exchangeRateApi");

const mockRequest = (query: any): Partial<Request> => ({
    query,
});
const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("getRates controller", () => {
    it("should throw BadRequestError if 'base' query is missing", async () => {
        const req = mockRequest({}) as Request;
        const res = mockResponse() as Response;

        await expect(getRates(req, res)).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError if base currency is not supported", async () => {
        const req = mockRequest({ base: "INVALID" }) as Request;
        const res = mockResponse() as Response;

        await expect(getRates(req, res)).rejects.toThrow(BadRequestError);
    });

    it("should return exchange rates for valid base currency", async () => {
        const req = mockRequest({ base: "USD" }) as Request;
        const res = mockResponse() as Response;

        (fetchExchangeRate as jest.Mock).mockResolvedValue({
            rates: {
                USD: 1,
                GBP: 0.8,
            },
        });

        await getRates(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                USD: 1,
                GBP: 0.8,
            })
        );
    });
});
