import { Pool, PoolClient, QueryConfig, QueryResultRow } from 'pg'
import { getEnv } from './env';

let pool: Pool

export default {
    connectToServer: async () => {
        pool = new Pool({
            connectionString: getEnv().POSTGRES_URI
        });

        const client = await pool.connect();
        client.release();

        console.log("Connected successfully to Postgres");
    },

    query: async <T extends QueryResultRow>(query: QueryConfig) => {
        const response = await pool.query<T>(query);
        // const start = Date.now();
        // const duration = Date.now() - start;
        // console.log('executed query', {text: query.text, duration, rows: response.rowCount });
    
        return response;
    },

    connectAClient: () => pool.connect(),

    release: (client: PoolClient) => client.release(),

    close: () => pool.end(),
};
