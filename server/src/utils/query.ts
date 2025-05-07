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
    [SortBy.DATE]: "exchanged_at",
    [SortBy.FROM]: "from_currency",
    [SortBy.TO]: "to_currency",
    [SortBy.AMOUNT]: "from_amount",
    [SortBy.RATE]: "exchange_rate",
    [SortBy.OUTPUT]: "to_amount",
};
