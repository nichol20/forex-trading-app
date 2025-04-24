import { MongoClient } from "mongodb";
import db from "../config/db";

describe("MongoDB container test", () => {
    it("should insert a document", async () => {
        const result = await db
            .getCollection("test")
            .insertOne({ hello: "world" });
        expect(result.insertedId).toBeDefined();
    });
});
