import db from "../config/db";
import { Exchange, ExchangeFilters, ExchangeOrderOptions, ExchangeRow } from "../types/exchange"
import { runQuery } from "../utils/db";
import { SortBy, sortByToExchangeKeyMap } from "../utils/query";

const subtractAmountQuery = `
    UPDATE users
    SET wallet = jsonb_set(wallet, $1::text[], ((wallet ->> $2::text)::numeric - $3)::text::jsonb, true)
    WHERE id = $4;
`

const addAmountQuery = `
    UPDATE users
    SET wallet = jsonb_set(
        wallet, 
        $1::text[], 
        to_jsonb((wallet ->> $2::text)::numeric + ($3::numeric * $4::numeric)), 
        true
    )
    WHERE id = $5
    RETURNING ($3::numeric * $4::numeric) AS to_amount;
`

const insertExchangeQuery = `
    INSERT INTO exchanges (user_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, exchanged_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *;
`

export const createExchange = async (exchange: Omit<Exchange, "id" | "exchangedAt" | "toAmount">): Promise<ExchangeRow> => {
    const { userId, fromCurrency, toCurrency, fromAmount, exchangeRate} = exchange;

    const client = await db.connectAClient();

    await client.query("BEGIN");

    await client.query({
        text: subtractAmountQuery, 
        values: [[fromCurrency], fromCurrency, fromAmount, userId]
    });

    const { rows } = await client.query({
        text: addAmountQuery, 
        values: [[toCurrency], toCurrency, fromAmount, exchangeRate, userId]
    });
    
    const res = await client.query<ExchangeRow>({
        text: insertExchangeQuery,
        values:[ userId, fromCurrency, toCurrency, fromAmount, rows[0].to_amount, exchangeRate ],
    });

    await client.query("COMMIT");

    db.release(client);

    return res.rows[0]
} 

export const getExchanges = async (
    userId: string, 
    orderOptions: ExchangeOrderOptions, 
    filters: ExchangeFilters
) => {
    const {
        start, end, from, to, minRate, maxRate,
        minAmount, maxAmount, minOutput, maxOutput,
    } = filters
    const whereClauses = ["user_id = $1"];
    const values: (number | string)[] = [userId];
    let idx = 2;

    // Add date range filter
    if (start) {
        whereClauses.push(`exchanged_at >= $${idx++}`);
        values.push(start);
    }
    if (end) {
        whereClauses.push(`exchanged_at <= $${idx++}`);
        values.push(end);
    }

    // Currency filters
    if (from) {
        whereClauses.push(`from_currency = $${idx++}`);
        values.push(from);
    }
    if (to) {
        whereClauses.push(`to_currency = $${idx++}`);
        values.push(to);
    }

    // Numeric range filters
    if (minRate != null) {
        whereClauses.push(`exchange_rate >= $${idx++}`);
        values.push(minRate);
    }
    if (maxRate != null) {
        whereClauses.push(`exchange_rate <= $${idx++}`);
        values.push(maxRate);
    }
    if (minAmount != null) {
        whereClauses.push(`from_amount >= $${idx++}`);
        values.push(minAmount);
    }
    if (maxAmount != null) {
        whereClauses.push(`from_amount <= $${idx++}`);
        values.push(maxAmount);
    }
    if (minOutput != null) {
        whereClauses.push(`to_amount >= $${idx++}`);
        values.push(minOutput);
    }
    if (maxOutput != null) {
        whereClauses.push(`to_amount <= $${idx++}`);
        values.push(maxOutput);
    }

    const whereSQL = "WHERE " + whereClauses.join(" AND ")

    const { page, limit, sortBy, sortOrder } = orderOptions
    const offset = (page - 1) * limit;
    values.push(limit, offset);
    const limitIdx  = idx++;
    const offsetIdx = idx++;

    const getExchangesQuery = `
        SELECT * FROM exchanges
        ${whereSQL}
        ORDER BY ${sortByToExchangeKeyMap[sortBy]} ${sortOrder.toLocaleUpperCase()}
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `
    const getCountQuery = `SELECT COUNT(*) FROM exchanges ${whereSQL}`

    const [dataRows, countRows] = await Promise.all([
        runQuery(getExchangesQuery, values),
        runQuery(getCountQuery, values.slice(0, limitIdx - 1))
    ])

    const totalItems = parseInt(countRows[0].count);

    return { totalItems, rows: dataRows };
} 