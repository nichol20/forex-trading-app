import { Server } from "socket.io";
import { fetchExchangeRate } from "../services/exchangeRateApi";
import { Currency, getAllCurrencies } from "./currency";
import { getList, pushToList } from "./redis";
import { Rates } from "../types/exchangeRateApi";
import { checkIf1MinuteHasPassed } from "./date";

const examplesMap: Record<Currency, Rates[]> = {
    [Currency.USD]: [
        { EUR: 0.8951, GBP: 0.7525, JPY: 145.73, BRL: 5.6709, USD: 1 },
        { EUR: 0.8983, GBP: 0.7550, JPY: 145.90, BRL: 5.6850, USD: 1 },
        { EUR: 0.8920, GBP: 0.7490, JPY: 144.88, BRL: 5.6400, USD: 1 },
        { EUR: 0.9005, GBP: 0.7582, JPY: 146.10, BRL: 5.7021, USD: 1 },
        { EUR: 0.8942, GBP: 0.7512, JPY: 145.50, BRL: 5.6623, USD: 1 },
        { EUR: 0.8965, GBP: 0.7531, JPY: 145.60, BRL: 5.6750, USD: 1 },
        { EUR: 0.8998, GBP: 0.7560, JPY: 145.99, BRL: 5.6900, USD: 1 },
        { EUR: 0.8912, GBP: 0.7483, JPY: 144.75, BRL: 5.6300, USD: 1 },
        { EUR: 0.8939, GBP: 0.7509, JPY: 145.45, BRL: 5.6605, USD: 1 },
        { EUR: 0.8971, GBP: 0.7540, JPY: 145.70, BRL: 5.6802, USD: 1 }
    ],
    [Currency.GBP]: [
        { GBP: 1, EUR: 1.1894, JPY: 193.66, BRL: 7.5557, USD: 1.3289 },
        { GBP: 1, EUR: 1.1920, JPY: 194.10, BRL: 7.5800, USD: 1.3315 },
        { GBP: 1, EUR: 1.1855, JPY: 193.00, BRL: 7.5200, USD: 1.3250 },
        { GBP: 1, EUR: 1.1952, JPY: 194.50, BRL: 7.6000, USD: 1.3342 },
        { GBP: 1, EUR: 1.1905, JPY: 193.80, BRL: 7.5650, USD: 1.3295 },
        { GBP: 1, EUR: 1.1918, JPY: 194.00, BRL: 7.5770, USD: 1.3308 },
        { GBP: 1, EUR: 1.1867, JPY: 193.30, BRL: 7.5300, USD: 1.3262 },
        { GBP: 1, EUR: 1.1844, JPY: 193.00, BRL: 7.5100, USD: 1.3238 },
        { GBP: 1, EUR: 1.1935, JPY: 194.20, BRL: 7.5900, USD: 1.3329 },
        { GBP: 1, EUR: 1.1908, JPY: 193.70, BRL: 7.5680, USD: 1.3298 }
    ],
    [Currency.BRL]: [
        { BRL: 1, EUR: 0.1575, GBP: 0.1324, JPY: 25.647, USD: 0.1760 },
        { BRL: 1, EUR: 0.1580, GBP: 0.1330, JPY: 25.700, USD: 0.1768 },
        { BRL: 1, EUR: 0.1568, GBP: 0.1318, JPY: 25.550, USD: 0.1750 },
        { BRL: 1, EUR: 0.1592, GBP: 0.1342, JPY: 25.800, USD: 0.1775 },
        { BRL: 1, EUR: 0.1572, GBP: 0.1322, JPY: 25.600, USD: 0.1761 },
        { BRL: 1, EUR: 0.1583, GBP: 0.1335, JPY: 25.720, USD: 0.1769 },
        { BRL: 1, EUR: 0.1570, GBP: 0.1320, JPY: 25.580, USD: 0.1760 },
        { BRL: 1, EUR: 0.1565, GBP: 0.1315, JPY: 25.500, USD: 0.1752 },
        { BRL: 1, EUR: 0.1590, GBP: 0.1340, JPY: 25.790, USD: 0.1772 },
        { BRL: 1, EUR: 0.1581, GBP: 0.1331, JPY: 25.705, USD: 0.1766 }
    ],
    [Currency.EUR]: [
        { EUR: 1, GBP: 0.8409, JPY: 162.83, BRL: 6.3537, USD: 1.1174 },
        { EUR: 1, GBP: 0.8430, JPY: 163.10, BRL: 6.3700, USD: 1.1201 },
        { EUR: 1, GBP: 0.8385, JPY: 162.50, BRL: 6.3300, USD: 1.1150 },
        { EUR: 1, GBP: 0.8452, JPY: 163.45, BRL: 6.4000, USD: 1.1232 },
        { EUR: 1, GBP: 0.8415, JPY: 162.70, BRL: 6.3600, USD: 1.1185 },
        { EUR: 1, GBP: 0.8428, JPY: 162.95, BRL: 6.3730, USD: 1.1198 },
        { EUR: 1, GBP: 0.8397, JPY: 162.60, BRL: 6.3400, USD: 1.1162 },
        { EUR: 1, GBP: 0.8378, JPY: 162.10, BRL: 6.3200, USD: 1.1140 },
        { EUR: 1, GBP: 0.8440, JPY: 163.30, BRL: 6.3900, USD: 1.1220 },
        { EUR: 1, GBP: 0.8420, JPY: 162.85, BRL: 6.3650, USD: 1.1189 }
    ],
    [Currency.JPY]: [
        { JPY: 1, EUR: 0.00614, GBP: 0.00516, BRL: 0.03902, USD: 0.00686 },
        { JPY: 1, EUR: 0.00618, GBP: 0.00520, BRL: 0.03920, USD: 0.00690 },
        { JPY: 1, EUR: 0.00610, GBP: 0.00514, BRL: 0.03880, USD: 0.00682 },
        { JPY: 1, EUR: 0.00620, GBP: 0.00522, BRL: 0.03930, USD: 0.00695 },
        { JPY: 1, EUR: 0.00613, GBP: 0.00515, BRL: 0.03900, USD: 0.00685 },
        { JPY: 1, EUR: 0.00616, GBP: 0.00518, BRL: 0.03910, USD: 0.00688 },
        { JPY: 1, EUR: 0.00612, GBP: 0.00514, BRL: 0.03895, USD: 0.00683 },
        { JPY: 1, EUR: 0.00609, GBP: 0.00512, BRL: 0.03870, USD: 0.00680 },
        { JPY: 1, EUR: 0.00619, GBP: 0.00521, BRL: 0.03925, USD: 0.00692 },
        { JPY: 1, EUR: 0.00615, GBP: 0.00517, BRL: 0.03905, USD: 0.00687 }
    ]
};

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
        
        const examples = examplesMap[currency]
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
        }

        io.emit(keyName, {
            rates,
            latestRates: rateList.map(r => JSON.parse(r))
        });
        setTimeout(() => broadcastRate(io, currency), 5_000); // 5s
    } catch (error: any) {
        // console.error(`Failed to fetch exchange rate for ${currency}:`, error);
        setTimeout(() => broadcastRate(io, currency), 10_000); // retry after 10s
    }
};
