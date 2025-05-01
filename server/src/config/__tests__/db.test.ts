import db from "../db";

describe("mongoClient", () => {
    it("should return a valid collection handle", () => {
        const collection = db.getCollection("testCollection");
        expect(collection.collectionName).toBe("testCollection");
    });
});
