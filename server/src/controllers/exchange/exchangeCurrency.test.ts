import { Request, Response } from "express";

import { BadRequestError } from "../../helpers/apiError";
import { validUser } from "../../../jest.setup-env";
import { Currency } from "../../utils/currency";

jest.mock("../../utils/exchangeRateApi", () => ({
    fetchExchangeRate: jest.fn()
}));

import { exchangeCurrency } from "./exchangeCurrency";
import { fetchExchangeRate } from "../../utils/exchangeRateApi";

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

describe("exchangeCurrency controller", () => {
    it("should throw BadRequestError if validation fails", async () => {
        const req = mockRequest({ amount: -10 }, validUser.id) as Request;
        const res = mockResponse() as Response;

        await expect(exchangeCurrency(req, res)).rejects.toThrow(
            BadRequestError
        );
    });

    it("should throw BadRequestError if fromCurrency and toCurrency are the same", async () => {
        const req = mockRequest(
            {
                amount: 100,
                fromCurrency: Currency.USD,
                toCurrency: Currency.USD,
            },
            validUser.id
        ) as Request;

        const res = mockResponse() as Response;

        await expect(exchangeCurrency(req, res)).rejects.toThrow(
            BadRequestError
        );
    });

    it("should throw BadRequestError if user has insufficient balance", async () => {
        const req = mockRequest(
            {
                amount: validUser.wallet.USD + 0.1,
                fromCurrency: "USD",
                toCurrency: "GBP",
            },
            validUser.id
        ) as Request;
        const res = mockResponse() as Response;

        await expect(exchangeCurrency(req, res)).rejects.toThrow(
            BadRequestError
        );
    });

    it("should convert currency, update wallet, and return new wallet", async () => {
        const testGBPRate = 0.5;
        const amount = 100;

        const req = mockRequest(
            {
                amount,
                fromCurrency: "USD",
                toCurrency: "GBP",
            },
            validUser.id
        ) as Request;
        const res = mockResponse() as Response;

        (fetchExchangeRate as jest.Mock).mockResolvedValue({
            rates: { GBP: testGBPRate },
        });

        await exchangeCurrency(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                USD: validUser.wallet.USD - amount,
                GBP: validUser.wallet.GBP + amount * testGBPRate,
            })
        );
    });
});
