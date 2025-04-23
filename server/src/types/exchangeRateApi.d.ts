import { Currency } from "../utils/currency";

export interface SuccessfulExchangeRateResponse {
    success: true;
    terms: string;
    privacy: string;
    timestamp: number;
    date: string;
    base: Currency;
    rates: {
        [key in Currency]: number;
    };
}

export interface FailedExchangeRateResponse {
    success: false;
}

export type ExchangeRateResponse =
    | SuccessfulExchangeRateResponse
    | FailedExchangeRateResponse;
