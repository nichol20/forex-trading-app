import { QueryResultRow } from "pg";
import db from "../config/db";

export const runQuery = async <T extends QueryResultRow>(queryText: string, values: any[]): Promise<T[]> => {
    try {
        const res = await db.query<T>({ text: queryText, values });
        return res.rows;
    } catch (err) {
        console.error(`Error executing query: ${queryText}`, err);
        throw err;
    }
};