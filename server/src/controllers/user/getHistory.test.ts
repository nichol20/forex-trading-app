import { Request, Response } from "express";

import { getHistory } from "./getHistory";
import { validExchangeHistory, validUser } from "../../../jest.setup-env";
import { SortBy, SortOrder } from "../../utils/query";
import { Currency } from "../../utils/currency";

const mockRequest = (userId: string, query?: any): Partial<Request> => ({
    userId,
    query
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

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                totalItems: validExchangeHistory.length
            })
        );
    });

    it("should fetch and return exchange history sorted by output in descending order", async () => {
        const req = mockRequest(validUser.id, {
            sortOrder: SortOrder.DESC,
            sortBy: SortBy.OUTPUT
        }) as Request;
        const res = mockResponse() as Response;

        await getHistory(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                history: validExchangeHistory.sort((a, b) => b.toAmount - a.toAmount)
            })
        )
    })

    it("should filter exchanges", async () => {
        const req = mockRequest(validUser.id, {
            from: Currency.USD,
            to: Currency.GBP,
            minAmount: "100",
            minRate: "0.8",
            minOutput: "80",
            maxAmount: "100",
            maxRate: "0.8",
            maxOutput: "80"
        }) as Request;
        const res = mockResponse() as Response;

        await getHistory(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                history: validExchangeHistory.filter(e => {
                    return e.fromCurrency === Currency.USD 
                        && e.toCurrency === Currency.GBP
                        && e.fromAmount === 100
                        && e.toAmount === 80
                        && e.exchangeRate === 0.8
                })
            })
        )
    })
});
