import { Request, Response } from "express";

import { isCurrency } from "../../utils/currency";
import { BadRequestError } from "../../helpers/apiError";
import { getList } from "../../utils/redis";

export const getLatestRates = async (req: Request, res: Response) => {
    if (!req.query.base) {
        throw new BadRequestError("You must use 'base' query");
    }

    const base = req.query.base;

    if (!isCurrency(base)) {
        throw new BadRequestError("We do not support this currency");
    }

    const rateList = await getList(`exchange-rates:${base}`)

    res.status(200).json(rateList.map(r => JSON.parse(r)));
    return;
};
