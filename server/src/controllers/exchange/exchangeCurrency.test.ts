import { Request, Response } from "express";

import { BadRequestError } from "../../helpers/apiError";
import { validUser } from "../../../jest.setup-env";
import { Currency } from "../../utils/currency";

jest.mock("../../services/exchangeRateApi", () => ({
    fetchExchangeRate: jest.fn()
}));

jest.mock("../../repositories/exchangeRepository", () => ({
    createExchange: jest.fn()
}));

import { exchangeCurrency } from "./exchangeCurrency";
import { fetchExchangeRate } from "../../services/exchangeRateApi";
import { findUserByEmail } from "../../repositories/userRepository";
import { createExchange } from "../../repositories/exchangeRepository";
import { Exchange } from "../../types/exchange";

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
        const user = await findUserByEmail(validUser.email)
        expect(user).not.toBeFalsy();
        
        const req = mockRequest(
            {
                amount: user!.wallet.USD + 0.1,
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

    it("should convert currency, update wallet, and return new exchange", async () => {
        const user = await findUserByEmail(validUser.email)
        expect(user).not.toBeFalsy();

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
        (createExchange as jest.Mock).mockImplementationOnce(
            (exchange: Omit<Exchange, "id" | "exchangedAt" | "toAmount" | "hubspotDealId">) => {
                // mock implementation to skip the API call by passing an id 
                return jest.requireActual("../../repositories/exchangeRepository")
                            .createExchange(exchange, "93821639816") // random id to avoid conflict with the setup ones
            }
        )

        await exchangeCurrency(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                exchangeRate: testGBPRate,
                fromAmount: amount,
                toAmount: amount * testGBPRate,
            })
        );
    }, 10_000);
});
