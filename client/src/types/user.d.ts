import { Currency } from "../utils/currency";

export type Wallet = {
    [key in Currency]: number;
};

export interface User {
    id: string;
    name: string;
    email: string;
    wallet: Wallet;
    createdAt: string;
}
