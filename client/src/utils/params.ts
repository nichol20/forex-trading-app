import { SortableField } from "../types/exchange";

export enum SortBy {
    DATE = "date",
    FROM = "from",
    TO = "to",
    AMOUNT = "amount",
    RATE = "rate",
    OUTPUT = "output",
}

// Mapping from SortBy enum values to Exchange keys
export const sortByToExchangeKeyMap: Record<SortBy, SortableField> = {
    [SortBy.DATE]: "exchangedAt",
    [SortBy.FROM]: "fromCurrency",
    [SortBy.TO]: "toCurrency",
    [SortBy.AMOUNT]: "fromAmount",
    [SortBy.RATE]: "exchangeRate",
    [SortBy.OUTPUT]: "toAmount",
};

export function isValidSortBy(value: string | null): value is SortBy {
    return Object.values(SortBy).includes(value as SortBy);
}
