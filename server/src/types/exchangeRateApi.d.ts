import { Currency } from "../utils/currency";

export type Rates = {
    [key in Currency]: number;
};

export interface SuccessfulExchangeRateResponse {
    base: Currency;
    results: Rates;
    updated: string;
    ms: number;
}

// Status codes: 400, 401, 403, 429
export interface FailedExchangeRateResponse {
    error?: string
}

export type ExchangeRateResponse =
    | SuccessfulExchangeRateResponse
    | FailedExchangeRateResponse;

export type TimeSeries = {
    [key in Currency]?: {
        [date: string]: number;
    };
}

export interface SuccessfulTimeSeriesResponse {
    start: string;
    end: string;
    interval: string;
    base: string;
    ms: number;
    results: TimeSeries
}

// Status codes: 400, 401, 403, 429
export interface FailedTimeSeriesResponse {
    error?: string
}

export type TimeSeriesReponse =
    | SuccessfulTimeSeriesResponse
    | FailedTimeSeriesResponse;
