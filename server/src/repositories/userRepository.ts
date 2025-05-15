import db from "../config/db";
import { createDealWithContactAssociation } from "../services/hubspotApi";
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
    INSERT INTO users (name, email, password, wallet, hubspot_contact_id)
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *
`

export const createUser = async (newUser: Omit<UserRow, "id" | "created_at">): Promise<UserRow> => {
    const { name, email, password, hubspot_contact_id, wallet } = newUser;
    
    const rows = await runQuery<UserRow>(createUserQuery, [name, email, password, wallet, hubspot_contact_id]);
    return rows[0];
}

const addToWalletQuery = `
    UPDATE users
    SET wallet = jsonb_set(wallet, $1::text[], to_jsonb((wallet->>$2)::numeric + $3), true)
    WHERE id = $4
    RETURNING *;
`

export const addToWallet = async (
    currency: Currency, 
    amount: number, 
    userId: string, 
    updateHubspot: boolean=true
): Promise<UserRow> => {
    const client = await db.connectAClient();

    await client.query("BEGIN");
    
    const { rows } = await client.query<UserRow>(
        addToWalletQuery, 
        [[currency.toString()], currency.toString(), amount, userId]
    );

    if(updateHubspot) {
        await createDealWithContactAssociation(rows[0].hubspot_contact_id, {
            amount,
            dealname: `${rows[0].name} added funds`,
            dealstage: "funds_received",
            pipeline: "default",
        });
    }

    await client.query("COMMIT");
    
    db.release(client);

    return rows[0];
}