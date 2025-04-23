import { Currency } from "../utils/currency";

export type Rates = {
    [key in Currency]: number;
};

export interface SuccessfulExchangeRateResponse {
    success: true;
    terms: string;
    privacy: string;
    timestamp: number;
    date: string;
    base: Currency;
    rates: Rates;
}

export interface FailedExchangeRateResponse {
    success: false;
}

export type ExchangeRateResponse =
    | SuccessfulExchangeRateResponse
    | FailedExchangeRateResponse;
