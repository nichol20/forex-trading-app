import { Request, Response } from "express";
import { getTimeSeriesQuerySchema } from "../../validators/exchange";
import { BadRequestError } from "../../helpers/apiError";
import { fetchTimeSeries } from "../../services/exchangeRateApi";

export const getTimeSeries = async (req: Request, res: Response) => {
    const parsed = getTimeSeriesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { from, to, start, end } = parsed.data

    const timeSeries = await fetchTimeSeries(from, to, start, end)
    console.log(timeSeries)
    res.status(200).json(timeSeries)
    return;
}