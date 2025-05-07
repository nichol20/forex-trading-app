import { Request, Response } from "express";

import { BadRequestError, InternalServerError } from "../../helpers/apiError";
import { fetchExchangeRate } from "../../utils/exchangeRateApi";
import { exchangeCurrencySchema } from "../../validators/exchange";
import { getAllCurrencies } from "../../utils/currency";
import { findUserById } from "../../repositories/userRepository";
import { Exchange } from "../../types/exchange";
import { exchange } from "../../repositories/exchangeRepository";

export const exchangeCurrency = async (req: Request, res: Response<Exchange>) => {
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
    
    const exchangeRow = await exchange({
        user_id: user.id,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        from_amount: amount,
        exchange_rate: currentRate,
    })

    res.status(200).json({
        id: exchangeRow.id,
        userId: exchangeRow.user_id,
        fromCurrency,
        toCurrency,
        fromAmount: exchangeRow.from_amount,
        toAmount: exchangeRow.to_amount,
        exchangeRate: exchangeRow.exchange_rate,
        exchangedAt: exchangeRow.exchanged_at,
    });
    return
};
