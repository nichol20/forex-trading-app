import { Document, MongoClient } from "mongodb";

const dbname = process.env.MONGO_DBNAME || "forex";
let client: MongoClient

export default {
    connectToServer: async () => {
        const uri = process.env.MONGO_URI!;
        client = new MongoClient(uri);
        await client.connect();
        console.log("Connected successfully to MongoDB");
    },

    getCollection: <T extends Document>(collection: string) =>
        client.db(dbname).collection<T>(collection),

    close: () => client.close(),

    dropDB: () => client.db(dbname).dropDatabase(),
};
