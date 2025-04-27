import { Exchange } from "../types/exchange";
import { OrderType } from "../types/order";

export const sortRecordsByDate = (records: Exchange[], type: OrderType) => {
    return records.sort((a, b) => {
        if (type === "ascendant")
            return Date.parse(a.exchangedAt) - Date.parse(b.exchangedAt);
        return Date.parse(b.exchangedAt) - Date.parse(a.exchangedAt);
    });
};

export const getInvertedRate = (rate: number): number => {
    return 1 / rate;
};
