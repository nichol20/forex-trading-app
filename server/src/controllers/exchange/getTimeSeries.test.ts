import { Request, Response } from "express";
import { getTimeSeries } from "./getTimeSeries";
import * as validator from "../../validators/exchange";
import * as api from "../../services/exchangeRateApi";
import { BadRequestError } from "../../helpers/apiError";
import { Currency } from "../../utils/currency";

jest.mock("../../services/exchangeRateApi");

describe("getTimeSeries", () => {
    const mockRequest = (query: any): Partial<Request> => ({ query });
    const mockResponse = () => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it("should return 200 with time series data for valid input", async () => {
        const req = mockRequest({ from: "USD", to: "EUR", start: "2024-01-01", end: "2024-01-31" }) as Request;
        const res = mockResponse() as Response;

        jest.spyOn(validator.getTimeSeriesQuerySchema, "safeParse").mockReturnValue({
            success: true,
            data: { from: Currency.USD, to: Currency.GBP, start: "2024-01-01", end: "2024-01-31" }
        } as any);

        const timSeries = { 
            [Currency.GBP]: { "2024-01-01": 0.9 } 
        };

        (api.fetchTimeSeries as jest.Mock).mockResolvedValue(timSeries);

        await getTimeSeries(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(timSeries);
    });

    it("should throw BadRequestError on validation failure", async () => {
        const req = mockRequest({}) as Request;
        const res = mockResponse() as Response;

        const error = { errors: [{ message: "Missing required fields" }] };
        jest.spyOn(validator.getTimeSeriesQuerySchema, "safeParse").mockReturnValue({
            success: false,
            error
        } as any);

        await expect(getTimeSeries(req, res)).rejects.toThrow(BadRequestError);
    });
});
