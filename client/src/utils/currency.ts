export enum Currency {
    GBP = "GBP",
    USD = "USD",
}

export const isCurrency = (value: any): value is Currency => {
    return Object.values(Currency).includes(value);
};
