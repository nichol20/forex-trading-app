import { Document, MongoClient } from "mongodb";
import { env } from "../app";

const uri = process.env.MONGO_URI!;
const dbname = process.env.MONGO_DBNAME || "forex";
const client = new MongoClient(uri);

export default {
    connectToServer: async () => {
        await client.connect();
        console.log("Connected successfully to MongoDB");
    },

    getCollection: <T extends Document>(collection: string) =>
        client.db(dbname).collection<T>(collection),

    close: () => client.close(),

    dropDB: () => client.db(dbname).dropDatabase(),
};
