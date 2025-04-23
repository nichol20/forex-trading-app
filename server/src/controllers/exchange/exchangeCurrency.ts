import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { UserDocument, Wallet } from "../../types/user";
import db from "../../config/db";
import { BadRequestError, InternalServerError } from "../../helpers/apiError";
import { fetchExchangeRate } from "../../utils/exchangeRateApi";
import { exchangeCurrencySchema } from "../../validators/exchange";
import { ExchangeDocument } from "../../types/exchange";
import { getAllCurrencies } from "../../utils/currency";

export const exchangeCurrency = async (req: Request, res: Response<Wallet>) => {
    const parsed = exchangeCurrencySchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }
    const { amount, fromCurrency, toCurrency } = parsed.data;

    if (fromCurrency === toCurrency) {
        throw new BadRequestError("The currencies must be of different types");
    }

    const userId = req.userId;
    const userCollection = db.getCollection<UserDocument>("users");
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        console.error("error finding authenticated user");
        throw new InternalServerError();
    }

    if (user.wallet[fromCurrency] < amount) {
        throw new BadRequestError("Insufficient amount for exchange");
    }

    const data = await fetchExchangeRate(fromCurrency, getAllCurrencies());
    const currentRate = data.rates[toCurrency];
    const convertedCurrency = amount * currentRate;

    user.wallet[fromCurrency] -= amount;
    user.wallet[toCurrency] += convertedCurrency;

    await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { wallet: user.wallet } }
    );

    const exchangeColection = db.getCollection<ExchangeDocument>("exchanges");
    exchangeColection.insertOne({
        exchangedAt: new Date().toISOString(),
        exchangeRate: currentRate,
        fromAmount: amount,
        toAmount: convertedCurrency,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        userId: userId!,
    });

    res.status(200).json(user.wallet);
};
