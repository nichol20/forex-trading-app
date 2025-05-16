import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

dotenv.config({
    path: path.resolve(__dirname, ".env.test")
})

jest.mock("./src/utils/http", () => ({
    hubspotClient: {
        get: jest.fn(),
        post: jest.fn(),
    },
    exchangeRateAPIClient: {
        get: jest.fn(),
        post: jest.fn(),
    }
}));

import db from "./src/config/db";
import { UserRow } from "./src/types/user";
import { Exchange } from "./src/types/exchange";
import { Currency } from "./src/utils/currency";
import { createUser } from "./src/repositories/userRepository";
import { createExchange } from "./src/repositories/exchangeRepository";
import { connectToRedis, disconnectFromRedis } from "./src/config/redis";


export let validUser: Omit<UserRow, "wallet">;
export let validExchangeHistory: Exchange[];

export const createValidUser = (): Omit<UserRow, "id" | "hubspot_contact_id" | "created_at"> => ({
    name: "joe",
    email: "joe@example.com",
    password: "joe123",
    wallet: {
        GBP: 1000,
        USD: 1000,
        EUR: 1000,
        JPY: 1000,
        BRL: 1000,
    }
});

export const createExchangeHistory = (userId: string): Omit<Exchange, "id" | "exchangedAt" | "toAmount" | "hubspotDealId">[] => [
    {
        userId,
        fromCurrency: Currency.USD,
        toCurrency: Currency.GBP,
        fromAmount: 100,
        exchangeRate: 0.75,
    },
    {
        userId,
        fromCurrency: Currency.GBP,
        toCurrency: Currency.USD,
        fromAmount: 100,
        exchangeRate: 1.5,
    },
    {
        userId,
        fromCurrency: Currency.GBP,
        toCurrency: Currency.USD,
        fromAmount: 1000,
        exchangeRate: 1.5,
    },
    {
        userId,
        fromCurrency: Currency.USD,
        toCurrency: Currency.GBP,
        fromAmount: 500,
        exchangeRate: 0.75,
    },
    {
        userId,
        fromCurrency: Currency.USD,
        toCurrency: Currency.GBP,
        fromAmount: 100,
        exchangeRate: 0.8,
    },
];

beforeAll(async () => {
    await db.connectToServer();
    await connectToRedis();
});

beforeEach(async () => {
    await db.query({ text: "DELETE FROM users" })
    await db.query({ text: "DELETE FROM exchanges" })
    
    // set up a user for testing
    const testUser = createValidUser();
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    const { password, ...partialValidUser } = testUser;

    const newUser = await createUser({ ...partialValidUser, password: hashedPassword, hubspot_contact_id: "9999" })
    expect(newUser.id).toBeDefined();

    validUser = newUser;

    // set up exchanges
    const exchanges = createExchangeHistory(newUser.id);
    validExchangeHistory = [];

    for (let i = 0; i < exchanges.length; i++) {
        const newExchange = await createExchange({ ...exchanges[i] }, String(i))
        expect(newExchange.id).toBeDefined();

        validExchangeHistory.push({
            id: newExchange.id,
            userId: newExchange.user_id,
            fromCurrency: newExchange.from_currency,
            toCurrency: newExchange.to_currency,
            fromAmount: parseFloat(newExchange.from_amount),
            toAmount: parseFloat(newExchange.to_amount),
            exchangeRate: parseFloat(newExchange.exchange_rate),
            exchangedAt: newExchange.exchanged_at,
            hubspotDealId: newExchange.hubspot_deal_id
        });
    }
});

afterAll(async () => {
    await db.close();
    await disconnectFromRedis();
});
