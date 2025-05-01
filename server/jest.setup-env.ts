import bcrypt from "bcrypt";

import db from "./src/config/db";
import { UserDocument } from "./src/types/user";
import { ExchangeDocument } from "./src/types/exchange";
import { ObjectId } from "mongodb";

export let validUser: UserDocument & { id: string };
export let validExchangeHistory: (ExchangeDocument & { id: string })[];

export const createValidUser = (): Omit<UserDocument, "id"> => ({
    name: "joe",
    email: "joe@example.com",
    password: "joe123",
    wallet: {
        GBP: 500,
        USD: 500,
    },
    createdAt: new Date().toISOString(),
});

export const createExchangeHistory = (userId: string): ExchangeDocument[] => [
    {
        userId,
        fromCurrency: "USD",
        toCurrency: "GBP",
        fromAmount: 100,
        toAmount: 75,
        exchangeRate: 0.75,
        exchangedAt: new Date().toISOString(),
    },
    {
        userId,
        fromCurrency: "GBP",
        toCurrency: "USD",
        fromAmount: 100,
        toAmount: 150,
        exchangeRate: 1.5,
        exchangedAt: new Date().toISOString(),
    },
    {
        userId,
        fromCurrency: "GBP",
        toCurrency: "USD",
        fromAmount: 1000,
        toAmount: 1500,
        exchangeRate: 1.5,
        exchangedAt: new Date().toISOString(),
    },
    {
        userId,
        fromCurrency: "USD",
        toCurrency: "GBP",
        fromAmount: 500,
        toAmount: 375,
        exchangeRate: 0.75,
        exchangedAt: new Date().toISOString(),
    },
    {
        userId,
        fromCurrency: "USD",
        toCurrency: "GBP",
        fromAmount: 100,
        toAmount: 80,
        exchangeRate: 0.8,
        exchangedAt: new Date().toISOString(),
    },
];

beforeAll(async () => {
    await db.connectToServer();
});

beforeEach(async () => {
    await db.getCollection("users").deleteMany({});
    await db.getCollection("exchanges").deleteMany({});
    
    // set up a user for testing
    const testUser = createValidUser();
    const userCollection = db.getCollection<UserDocument>("users");
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    const { password, ...partialValidUser } = testUser;

    const { insertedId } = await userCollection.insertOne({
        ...partialValidUser,
        password: hashedPassword,
    });
    expect(insertedId).toBeDefined();
    const user = await userCollection.findOne({ _id: insertedId })
    expect(user).not.toBeNull(); // giving null
    const { _id, ...partialUser } = user!

    const userId = _id.toString();

    validUser = {
        ...partialUser,
        password: testUser.password,
        id: userId,
    };

    // set up exchanges
    const exchangeColection = db.getCollection<ExchangeDocument>("exchanges");
    const exchanges = createExchangeHistory(userId);
    validExchangeHistory = [];

    for (const ex of exchanges) {
        const { insertedId } = await exchangeColection.insertOne(ex);
        expect(insertedId).toBeDefined();
        const exchange = await exchangeColection.findOne({ _id: insertedId })
        expect(exchange).not.toBeNull() // giving null
        const { _id, ...partialExchange } = exchange!

        validExchangeHistory.push({
            ...partialExchange!,
            id: _id.toString(),
        });
    }
});

afterAll(async () => {
    await db.close();
});
