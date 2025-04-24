import db from "../db";

describe("mongoClient", () => {
    it("should connect to MongoDB without throwing", async () => {
        const spy = jest.spyOn(console, "log").mockImplementation(() => {});
        await db.connectToServer();
        expect(spy).toHaveBeenCalledWith("Connected successfully to MongoDB");
        spy.mockRestore();
    });

    it("should return a valid collection handle", () => {
        const collection = db.getCollection<{ test: string }>("testCollection");
        expect(collection.collectionName).toBe("testCollection");
    });
});
