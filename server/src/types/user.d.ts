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
    hubspotContactId: string;
}

export type UserRow = Omit<User, "createdAt" | "hubspotContactId"> & {
    created_at: string;
    hubspot_contact_id: string;
    password: string;
};
