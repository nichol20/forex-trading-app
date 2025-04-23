import { Server } from "socket.io";
import { fetchExchangeRate } from "./exchangeRateApi";
import { Currency, getAllCurrencies } from "./currency";

const examples = [
    { GBP: 1, USD: 1.329115 },
    { GBP: 1, USD: 1.328709 },
    { GBP: 1, USD: 1.328709 },
    { GBP: 1, USD: 1.329186 },
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
        setTimeout(() => broadcastRate(io, currency), 10_000); // 60s
    } catch (error: any) {
        console.error(`Failed to fetch exchange rate for ${currency}:`, error);
        setTimeout(() => broadcastRate(io, currency), 60_000); // retry after 60s
    }
};
