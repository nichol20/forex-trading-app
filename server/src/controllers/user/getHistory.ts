import { Request, Response } from "express";

import { getHistoryQuerySchema } from "../../validators/user";
import { BadRequestError } from "../../helpers/apiError";
import { getExchanges } from "../../repositories/exchangeRepository";
import { Exchange } from "../../types/exchange";

export const getHistory = async (req: Request, res: Response) => {
    const userId = req.userId;
    const reqQuery = req.query ? req.query : {}

    const parsed = getHistoryQuerySchema.safeParse(reqQuery);

    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { page, limit, start, end } = parsed.data;

    end?.setDate(end.getDate() + 1)
    const { rows, totalItems } = await getExchanges(userId!, {...parsed.data}, {
        ...parsed.data, 
        start: start?.toISOString(),
        end: end?.toISOString()
    })

    const totalPages = Math.ceil(totalItems / limit);

    const history: Exchange[] = rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        exchangedAt: row.exchanged_at,
        fromCurrency: row.from_currency,
        toCurrency: row.to_currency,
        exchangeRate: parseFloat(row.exchange_rate),
        fromAmount: parseFloat(row.from_amount),
        toAmount: parseFloat(row.to_amount),
        hubspotDealId: row.hubspot_deal_id
    }));

    res.status(200).json({
        history,
        totalItems,
        currentPage: page,
        totalPages,
    });

    return;
};
