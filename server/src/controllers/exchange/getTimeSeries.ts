import { Request, Response } from "express";
import { getTimeSeriesQuerySchema } from "../../validators/exchange";
import { BadRequestError } from "../../helpers/apiError";
import { fetchTimeSeries } from "../../utils/exchangeRateApi";

export const getTimeSeries = async (req: Request, res: Response) => {
    const parsed = getTimeSeriesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
        console.log(parsed.error.errors)
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { from, to, start, end } = parsed.data

    const timeSeries = await fetchTimeSeries(from, to, start, end)
    res.status(200).json(timeSeries)
    return
}