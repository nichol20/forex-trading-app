export enum SortBy {
    DATE = "date",
    FROM = "from",
    TO = "to",
    AMOUNT = "amount",
    RATE = "rate",
    OUTPUT = "output",
}

export function isValidSortBy(value: string | null): value is SortBy {
    return Object.values(SortBy).includes(value as SortBy);
}
