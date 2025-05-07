import { Request, Response } from "express";

import { getHistoryQuerySchema } from "../../validators/user";
import { BadRequestError } from "../../helpers/apiError";
import { getExchanges } from "../../repositories/exchangeRepository";

export const getHistory = async (req: Request, res: Response) => {
    const userId = req.userId;
    const reqQuery = req.query ? req.query : {}

    const parsed = getHistoryQuerySchema.safeParse(reqQuery);

    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { page, limit, start, end } = parsed.data;

    const { history, totalItems } = await getExchanges(userId!, {...parsed.data}, {
        ...parsed.data, 
        start: start?.toISOString(), 
        end: end?.toISOString()
    })

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
        history,
        totalItems,
        currentPage: page,
        totalPages,
    });

    return;
};
