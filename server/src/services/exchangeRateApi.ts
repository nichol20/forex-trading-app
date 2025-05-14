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
    const searchParams = new URLSearchParams({
        from: base,
        to: currencies.join(","),
        api_key: getEnv().EXCHANGERATE_API_KEY,
    });
    const { data } = await exchangeRateAPIClient.get<ExchangeRateResponse>(
        `/fetch-multi?${searchParams.toString()}`
    );

    if (!("results" in data)) {
        throw new Error("Error requesting base code rate: " + data);
    }

    data.results[base] = 1;

    return {
        rates: data.results
    };
};

export const fetchTimeSeries = async (
    from: Currency,
    to: Currency,
    start: Date,
    end: Date
): Promise<TimeSeries> => {
    // "start" and "end" format: YYYY-MM-DD
    const startStr = toUtcDateString(start);
    const endStr = toUtcDateString(end);

    // Historical data limited to 14 days during trial
    const searchParams = new URLSearchParams({
        from,
        to,
        api_key: getEnv().EXCHANGERATE_API_KEY,
        start: startStr,
        end: endStr,
        interval: "P1D" // api only supports this one for now (daily)
    });

    const { data } = await exchangeRateAPIClient.get<TimeSeriesReponse>(
        `/time-series?${searchParams.toString()}`
    );

    if (!("results" in data)) {
        throw new Error("Error requesting time series: " + data.error);
    }

    return data.results;
};
