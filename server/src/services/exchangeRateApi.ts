import { getEnv } from "../config/env";
import { Currency } from "../utils/currency";
import {
    ExchangeRateResponse,
    Rates,
    TimeSeries,
    TimeSeriesReponse,
} from "../types/exchangeRateApi";
import { toUtcDateString } from "../utils/date";
import { exchangeRateAPIClient } from "../utils/http";

export const fetchExchangeRate = async (
    base: Currency,
    currencies: Currency[]
): Promise<{ rates: Rates }> => {
    // const searchParams = new URLSearchParams({
    //     from: base,
    //     to: currencies.join(","),
    //     api_key: getEnv().EXCHANGERATE_API_KEY,
    // });
    // const { data } = await exchangeRateAPIClient.get<ExchangeRateResponse>(
    //     `/fetch-multi?${searchParams.toString()}`
    // );

    // if (!("results" in data)) {
    //     throw new Error("Error requesting base code rate: " + data);
    // }

    // data.results[base] = 1;

    return {
        rates: {
            USD: 1,
            GBP: 0.75
        }
    };
};

export const fetchTimeSeries = async (
    from: Currency,
    to: Currency,
    start: Date,
    end: Date
): Promise<TimeSeries> => {
    // // "start" and "end" format: YYYY-MM-DD
    // const startStr = toUtcDateString(start);
    // const endStr = toUtcDateString(end);

    // // Historical data limited to 14 days during trial
    // const searchParams = new URLSearchParams({
    //     from,
    //     to,
    //     api_key: getEnv().EXCHANGERATE_API_KEY,
    //     start: startStr,
    //     end: endStr,
    //     interval: "P1D" // api only supports this one for now (daily)
    // });

    // const { data } = await exchangeRateAPIClient.get<TimeSeriesReponse>(
    //     `/time-series?${searchParams.toString()}`
    // );

    // if (!("results" in data)) {
    //     throw new Error("Error requesting time series: " + data.error);
    // }

    return {
        "GBP": {
            "2025-04-30": 0.88012,
            "2025-05-01": 0.88629,
            "2025-05-02": 0.87921,
            "2025-05-03": 0.88491,
            "2025-05-04": 0.88416,
            "2025-05-05": 0.88189,
            "2025-05-06": 0.88125,
            "2025-05-07": 0.87967,
            "2025-05-08": 0.88669,
            "2025-05-09": 0.88737,
            "2025-05-10": 0.88849,
            "2025-05-11": 0.88849,
            "2025-05-12": 0.89958,
            "2025-05-13": 0.89583
        }
    }
};
