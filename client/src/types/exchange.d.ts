import { Currency } from "../utils/currency";

export type Rates = {
    [key in Currency]: number;
};

export interface Exchange {
    id: string;
    userId: string;
    fromCurrency: string;
    toCurrency: string;
    fromAmount: number;
    toAmount: number;
    exchangeRate: number;
    exchangedAt: string;
}