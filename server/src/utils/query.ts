import { SortableField } from "../types/exchange";

export enum SortBy {
    DATE = "date",
    FROM = "from",
    TO = "to",
    AMOUNT = "amount",
    RATE = "rate",
    OUTPUT = "output",
}

export enum SortOrder {
    ASC = "asc",
    DESC = "desc",
}

export const sortByToExchangeKeyMap: Record<SortBy, SortableField> = {
    [SortBy.DATE]: "exchangedAt",
    [SortBy.FROM]: "fromCurrency",
    [SortBy.TO]: "toCurrency",
    [SortBy.AMOUNT]: "fromAmount",
    [SortBy.RATE]: "exchangeRate",
    [SortBy.OUTPUT]: "toAmount",
};
