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
];

beforeAll(async () => {
    await db.connectToServer();
});

beforeEach(async () => {
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

    const userId = insertedId.toString();

    validUser = {
        ...partialValidUser,
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
        const { _id, ...partialExchange } = ex as ExchangeDocument & {
            _id: ObjectId;
        };

        validExchangeHistory.push({
            ...partialExchange,
            id: insertedId.toString(),
        });
    }
});

afterEach(async () => {
    await db.getCollection("users").deleteMany({});
    await db.getCollection("exchanges").deleteMany({});
});

afterAll(async () => {
    await db.close();
});
