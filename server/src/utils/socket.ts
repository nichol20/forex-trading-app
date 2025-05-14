import { Server } from "socket.io";
import { fetchExchangeRate } from "../services/exchangeRateApi";
import { Currency, getAllCurrencies } from "./currency";
import { getList, pushToList } from "./redis";
import { Rates } from "../types/exchangeRateApi";
import { checkIf1MinuteHasPassed } from "./date";

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
    broadcastRate(io, Currency.GBP);
    broadcastRate(io, Currency.USD);
};

interface RateItem {
    time: number
    rates: Rates
}

const broadcastRate = async (io: Server, currency: Currency) => {
    try {
        const keyName = `exchange-rates:${currency}`
        // const data = await fetchExchangeRate(currency, getAllCurrencies());

        // io.emit(`exchange-rates:${currency}`, data.rates);
        // console.log(data.rates);

        const rates = examples[Math.floor(Math.random() * examples.length)];

        let rateList = await getList(keyName);

        if(
            rateList.length === 0
            || checkIf1MinuteHasPassed((JSON.parse(rateList[rateList.length - 1]) as RateItem).time)
        ) {
            rateList = await pushToList(keyName, JSON.stringify({
                time: Date.now(),
                rates
            }), 15)
            console.log(rateList);
        }

        io.emit(keyName, {
            rates,
            lastRates: rateList.map(r => JSON.parse(r))
        });
        setTimeout(() => broadcastRate(io, currency), 5_000); // 5s
    } catch (error: any) {
        // console.error(`Failed to fetch exchange rate for ${currency}:`, error);
        setTimeout(() => broadcastRate(io, currency), 10_000); // retry after 10s
    }
};
