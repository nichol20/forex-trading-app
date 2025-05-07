import { User, UserRow, Wallet } from "../types/user";
import { Currency } from "../utils/currency";
import { runQuery } from "../utils/db";

const findUserByEmailQuery = `
    SELECT * FROM users WHERE email = $1;
`;

export const findUserByEmail = async (email: string): Promise<UserRow | undefined> => {
    const rows = await runQuery<UserRow>(findUserByEmailQuery, [email]);
    if(rows.length === 0) return;
    return rows[0];
}

const findUserByIdQuery = `
    SELECT * FROM users WHERE id = $1;
`;

export const findUserById = async (userId: string): Promise<UserRow | undefined> => {
    const rows = await runQuery<UserRow>(findUserByIdQuery, [userId]);
    if(rows.length === 0) return;
    return rows[0];
}

const createUserQuery = `
    INSERT INTO users (name, email, password, wallet)
    VALUES ($1, $2, $3, $4) 
    RETURNING *
`

export const createUser = async (newUser: Omit<UserRow, "id" | "created_at">): Promise<UserRow> => {
    const { name, email, password } = newUser;
    const wallet: Wallet = {
        USD: 0,
        GBP: 0
    }
    const rows = await runQuery<UserRow>(createUserQuery, [name, email, password, wallet]);
    return rows[0];
}

const addToWalletQuery = `
    UPDATE users
    SET wallet = jsonb_set(wallet, $1::text[], to_jsonb((wallet->>$2)::numeric + $3), true)
    WHERE id = $4
    RETURNING *;
`

export const addToWallet = async (currency: Currency, amount: number, userId: string): Promise<UserRow> => {
    const rows = await runQuery<UserRow>(
        addToWalletQuery, 
        [[currency.toString()], currency.toString(), amount, userId]
    );
    return rows[0];
}