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

export type ExchangeDocument = Omit<Exchange, "id">;

export type SortableField = keyof Pick<
    Exchange,
    | "fromCurrency"
    | "toCurrency"
    | "fromAmount"
    | "toAmount"
    | "exchangeRate"
    | "exchangedAt"
>;
