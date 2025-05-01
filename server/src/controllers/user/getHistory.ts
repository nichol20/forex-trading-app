import { Request, Response } from "express";
import { Filter } from "mongodb";

import db from "../../config/db";
import { ExchangeDocument } from "../../types/exchange";
import { getHistoryQuerySchema } from "../../validators/user";
import { BadRequestError } from "../../helpers/apiError";
import { sortByToExchangeKeyMap } from "../../utils/query";

export const getHistory = async (req: Request, res: Response) => {
    const userId = req.userId;
    const reqQuery = req.query ? req.query : {}

    const parsed = getHistoryQuerySchema.safeParse(reqQuery);

    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const {
        page,
        limit,
        sortBy,
        sortOrder,
        start,
        end,
        from,
        to,
        minRate,
        maxRate,
        minAmount,
        maxAmount,
        minOutput,
        maxOutput,
    } = parsed.data;

    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const query: Filter<ExchangeDocument> = {
        userId,
    };

    if (start || end) {
        query.exchangedAt = {};
        if (start) query.exchangedAt.$gte = start.toISOString();
        if (end) query.exchangedAt.$lte = end.toISOString();
    }

    if (from) query.fromCurrency = from;
    if (to) query.toCurrency = to;

    if (minRate || maxRate) {
        query.exchangeRate = {};
        if (minRate) query.exchangeRate.$gte = minRate;
        if (maxRate) query.exchangeRate.$lte = maxRate;
    }

    if (minAmount || maxAmount) {
        query.fromAmount = {};
        if (minAmount) query.fromAmount.$gte = minAmount;
        if (maxAmount) query.fromAmount.$lte = maxAmount;
    }

    if (minOutput || maxOutput) {
        query.toAmount = {};
        if (minOutput) query.toAmount.$gte = minOutput;
        if (maxOutput) query.toAmount.$lte = maxOutput;
    }

    const exchangeCollection = db.getCollection<ExchangeDocument>("exchanges");

    const totalItems = await exchangeCollection.countDocuments(query);
    const history = (
        await exchangeCollection
            .find(query)
            .sort({ [sortByToExchangeKeyMap[sortBy]]: sortDirection })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray()
    ).map(({ _id, ...partialEx }) => ({ id: _id.toString(), ...partialEx }));

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
        history,
        totalItems,
        currentPage: page,
        totalPages,
    });

    return;
};
