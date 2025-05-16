export enum Currency {
    GBP = "GBP",
    USD = "USD",
    BRL = "BRL",
    EUR = "EUR",
    JPY = "JPY"
}

export const getAllCurrencies = (): Currency[] => {
    return Object.values(Currency);
};

export const isCurrency = (value: any): value is Currency => {
    return getAllCurrencies().includes(value);
};
