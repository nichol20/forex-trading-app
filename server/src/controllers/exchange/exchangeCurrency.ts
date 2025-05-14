import { Request, Response } from "express";

import { BadRequestError, InternalServerError } from "../../helpers/apiError";
import { fetchExchangeRate } from "../../services/exchangeRateApi";
import { exchangeCurrencySchema } from "../../validators/exchange";
import { getAllCurrencies } from "../../utils/currency";
import { findUserById } from "../../repositories/userRepository";
import { Exchange } from "../../types/exchange";
import { createExchange } from "../../repositories/exchangeRepository";
import { ExchangeQueue } from "../../config/queue";

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

    await ExchangeQueue.enqueue(user.id, parsed.data);
    
    await ExchangeQueue.process(user.id, async payload => {
        await new Promise(r => setTimeout(r, 5000)); // heavy process
        const currentRate = data.rates[toCurrency];
        
        const exchangeRow = await createExchange({
            userId: user.id,
            fromCurrency: payload.fromCurrency,
            toCurrency: payload.toCurrency,
            fromAmount: payload.amount,
            exchangeRate: currentRate,
        }) 
        
        res.status(200).json({
            id: exchangeRow.id,
            userId: exchangeRow.user_id,
            fromCurrency: payload.fromCurrency,
            toCurrency: payload.toCurrency,
            fromAmount: parseFloat(exchangeRow.from_amount),
            toAmount: parseFloat(exchangeRow.to_amount),
            exchangeRate: parseFloat(exchangeRow.exchange_rate),
            exchangedAt: exchangeRow.exchanged_at,
            hubspotDealId: exchangeRow.hubspot_deal_id
        });
    })
    return
};
