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

export type UserRow = Omit<User, "createdAt"> & { created_at: string, password: string };
