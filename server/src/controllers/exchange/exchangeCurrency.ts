import { Request, Response } from "express";

import { BadRequestError, InternalServerError } from "../../helpers/apiError";
import { fetchExchangeRate } from "../../services/exchangeRateApi";
import { exchangeCurrencySchema } from "../../validators/exchange";
import { getAllCurrencies } from "../../utils/currency";
import { findUserById } from "../../repositories/userRepository";
import { ExchangeQueue } from "../../utils/queue";

export const exchangeCurrency = async (req: Request, res: Response) => {
    const parsed = exchangeCurrencySchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }
    const { amount, fromCurrency, toCurrency } = parsed.data;

    if (fromCurrency === toCurrency) {
        throw new BadRequestError("The currencies must be of different types");
    }

    const userId = req.userId;
    const user = await findUserById(userId!);

    if (!user) {
        console.error("error finding authenticated user");
        throw new InternalServerError();
    }

    if (user.wallet[fromCurrency] < amount) {
        throw new BadRequestError("Insufficient amount for exchange");
    }
    const data = await fetchExchangeRate(fromCurrency, getAllCurrencies());
    const currentRate = data.rates[toCurrency];

    await ExchangeQueue.enqueue(user.id, {...parsed.data, rate: currentRate});
    
    res.status(200).json({ message: "Exchange queued successfully" });
    return
};
