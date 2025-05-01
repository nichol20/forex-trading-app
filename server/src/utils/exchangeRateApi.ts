import axios from "axios";

import { getEnv } from "../config/env";
import { Currency } from "./currency";
import {
    ExchangeRateResponse,
    Rates,
    TimeSeriesReponse,
} from "../types/exchangeRateApi";
import { formatDate } from "./date";

const exchangeApiUrl = `https://api.beta.fastforex.io`;

export const fetchExchangeRate = async (
    base: Currency,
    currencies: Currency[]
): Promise<{ rates: Rates }> => {
    const searchParams = new URLSearchParams({
        from: base,
        to: currencies.join(","),
        api_key: getEnv().EXCHANGERATE_API_KEY,
    });
    const { data } = await axios.get<ExchangeRateResponse>(
        `${exchangeApiUrl}/fetch-multi?${searchParams.toString()}`
    );

    if (!("results" in data)) {
        throw new Error("Error requesting base code rate: " + data);
    }

    data.results[base] = 1;

    return {
        rates: data.results,
    };
};

export const fetchTimeSeries = async (
    from: Currency,
    to: Currency,
    start: Date,
    end: Date
) => {
    // "start" and "end" format: YYYY-MM-DD
    const startStr = formatDate(start);
    const endStr = formatDate(end);

    // Historical data limited to 14 days during trial
    const searchParams = new URLSearchParams({
        from,
        to,
        api_key: getEnv().EXCHANGERATE_API_KEY,
        start: startStr,
        end: endStr,
        interval: "P1D" // api only supports this one for now (daily)
    });

    const { data } = await axios.get<TimeSeriesReponse>(
        `${exchangeApiUrl}/time-series?${searchParams.toString()}`
    );

    if (!("results" in data)) {
        throw new Error("Error requesting time series: " + data.error);
    }

    return data.results;
};
