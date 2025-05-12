import { Server } from "socket.io";
import { fetchExchangeRate } from "../services/exchangeRateApi";
import { Currency, getAllCurrencies } from "./currency";

const examples = [
    { USD: 1, GBP: 0.829115 },
    { USD: 1, GBP: 0.828709 },
    { USD: 1, GBP: 0.828709 },
    { USD: 1, GBP: 0.829186 },
    { USD: 1, GBP: 0.832112 },
    { USD: 1, GBP: 0.832114 },
    { USD: 1, GBP: 0.832166 },
];

export const startBroadcasts = async (io: Server) => {
    // broadcastRate(io, Currency.GBP);
    broadcastRate(io, Currency.USD);
};

const broadcastRate = async (io: Server, currency: Currency) => {
    try {
        // const data = await fetchExchangeRate(currency, getAllCurrencies());

        // io.emit(`exchange-rates:${currency}`, data.rates);
        // console.log(data.rates);

        const rate = examples[Math.floor(Math.random() * examples.length)];
        io.emit(`exchange-rates:${currency}`, rate);

        setTimeout(() => broadcastRate(io, currency), 5_000); // 5s
    } catch (error: any) {
        // console.error(`Failed to fetch exchange rate for ${currency}:`, error);
        setTimeout(() => broadcastRate(io, currency), 10_000); // retry after 10s
    }
};
