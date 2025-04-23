import { Request, Response } from "express";

import { isCurrency } from "../../utils/currency";
import { fetchExchangeRate } from "../../utils/exchangeRateApi";
import { BadRequestError } from "../../helpers/apiError";

export const getRates = async (req: Request, res: Response) => {
    if (!req.query.base) {
        throw new BadRequestError("You must use 'base' query");
    }

    const base = req.query.base;

    if (!isCurrency(base)) {
        throw new BadRequestError("We do not support this currency");
    }

    const exchangeRate = await fetchExchangeRate(base);

    res.status(200).json(exchangeRate.conversion_rates);
};
