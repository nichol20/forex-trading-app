import { Request, Response } from "express";
import db from "../../config/db";
import { Exchange, ExchangeDocument } from "../../types/exchange";
import { getHistoryQuerySchema } from "../../validators/exchange";
import { BadRequestError } from "../../helpers/apiError";

export const getHistory = async (req: Request, res: Response) => {
    const userId = req.userId;

    const parsed = getHistoryQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { page, limit, sortBy, sortOrder } = parsed.data;
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const exchangeCollection = db.getCollection<ExchangeDocument>("exchanges");

    const totalItems = await exchangeCollection.countDocuments({ userId });
    const history = (
        await exchangeCollection
            .find({ userId })
            .sort({ [sortBy]: sortDirection })
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
};
