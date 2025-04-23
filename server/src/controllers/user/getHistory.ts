import { Request, Response } from "express";

import { Exchange, ExchangeDocument } from "../../types/exchange";
import db from "../../config/db";

export const getHistory = async (req: Request, res: Response<Exchange[]>) => {
    const userId = req.userId;

    const exchangeCollection = db.getCollection<ExchangeDocument>("exchanges");
    const history = (await exchangeCollection.find({ userId }).toArray()).map(
        ({ _id, ...partialEx }) => ({ id: _id.toString(), ...partialEx })
    );

    res.status(200).json(history);
};
