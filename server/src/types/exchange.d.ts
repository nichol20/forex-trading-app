import { Currency } from "../utils/currency";
import { SortBy, SortOrder } from "../utils/query";

export interface Exchange {
    id: string;
    userId: string;
    fromCurrency: Currency;
    toCurrency: Currency;
    fromAmount: number;
    toAmount: number;
    exchangeRate: number;
    exchangedAt: string;
}

export interface ExchangeRow {
    id: string;
    user_id: string;
    from_currency: Currency;
    to_currency: Currency;
    from_amount: number;
    to_amount: number;
    exchange_rate: number;
    exchanged_at: string;
}

export type SortableField = keyof Pick<
    ExchangeRow,
    | "from_currency"
    | "to_currency"
    | "from_amount"
    | "to_amount"
    | "exchange_rate"
    | "exchanged_at"
>;

export interface ExchangeOrderOptions {
    sortBy: SortBy;
    sortOrder: SortOrder;
    limit: number;
    page: number;
}

export interface ExchangeFilters {
    start?: string | null;
    end?: string | null;
    from?: Currency | null;
    to?: Currency | null;
    minRate?: number | null;
    maxRate?: number | null;
    minAmount?: number | null;
    maxAmount?: number | null;
    minOutput?: number | null;
    maxOutput?: number | null;
}