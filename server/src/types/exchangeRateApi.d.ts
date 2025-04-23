import { Currency } from "../utils/currency";

export interface SuccessfulExchangeRateResponse {
    result: "success";
    time_last_update_unix: number;
    time_last_update_utc: string;
    time_next_update_unix: number;
    time_next_update_utc: string;
    base_code: Currency;
    conversion_rates: {
        [key in Currency]: number;
    };
}

export interface FailedExchangeRateResponse {
    result: "error";
    "error-type":
        | "unknown-code"
        | "unsupported-code"
        | "malformed-request"
        | "invalid-key"
        | "inactive-account"
        | "quota-reached";
}

export type ExchangeRateResponse =
    | SuccessfulExchangeRateResponse
    | FailedExchangeRateResponse;
