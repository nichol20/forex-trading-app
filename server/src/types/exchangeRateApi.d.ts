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
export interface FailedExchangeRateResponse {}

export type ExchangeRateResponse =
    | SuccessfulExchangeRateResponse
    | FailedExchangeRateResponse;
