import axios from "axios";

import { getEnv } from "../config/env";
import { Currency } from "../utils/currency";
import {
    ExchangeRateResponse,
    Rates,
    TimeSeriesReponse,
} from "../types/exchangeRateApi";
import { toUtcDateString } from "../utils/date";

const exchangeApiUrl = `https://api.beta.fastforex.io`;

export const fetchExchangeRate = async (
    base: Currency,
    currencies: Currency[]
): Promise<{ rates: Rates }> => {
    // const searchParams = new URLSearchParams({
    //     from: base,
    //     to: currencies.join(","),
    //     api_key: getEnv().EXCHANGERATE_API_KEY,
    // });
    // const { data } = await axios.get<ExchangeRateResponse>(
    //     `${exchangeApiUrl}/fetch-multi?${searchParams.toString()}`
    // );

    // if (!("results" in data)) {
    //     throw new Error("Error requesting base code rate: " + data);
    // }

    // data.results[base] = 1;

    return {
        rates: {
            USD: 1,
            GBP: 0.75387261
        },
    };
};

export const fetchTimeSeries = async (
    from: Currency,
    to: Currency,
    start: Date,
    end: Date
) => {
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

    // const { data } = await axios.get<TimeSeriesReponse>(
    //     `${exchangeApiUrl}/time-series?${searchParams.toString()}`
    // );

    // if (!("results" in data)) {
    //     throw new Error("Error requesting time series: " + data.error);
    // }

    // return data.results;
    return {
        GBP: {
            "2025-05-09": 0.75243,
            "2025-05-08": 0.75213,
            "2025-05-07": 0.74123,
            "2025-05-06": 0.75905,
            "2025-05-05": 0.74120,
            "2025-05-04": 0.74213,
            "2025-05-03": 0.76523,
            "2025-05-02": 0.76231,
            "2025-05-01": 0.74232,
            "2025-04-30": 0.74923,
            "2025-04-29": 0.75394,
            "2025-04-28": 0.75123,
            "2025-04-27": 0.77321,
        }
    }
};
