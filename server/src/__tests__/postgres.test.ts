import db from "../config/db";

describe("Postgres container test", () => {
    it("should query a row", async () => {
        const result = await db.query({
            text: "SELECT 1 AS test;"
        })

        expect(result.rowCount).toBe(1);
    });

    it("should return information from the users table", async () => {
        const result = await db.query({
            text: "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
        })

        expect(result.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ column_name: 'wallet' })
            ])
        );
    });
});
