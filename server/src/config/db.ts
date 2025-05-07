import { Pool, PoolClient, QueryConfig, QueryResultRow } from 'pg'
import { getEnv } from './env';

let pool: Pool

export default {
    connectToServer: async () => {
        pool = new Pool({
            connectionString: getEnv().POSTGRES_URI
        });

        await pool.connect();

        console.log("Connected successfully to Postgres");
    },

    query: async <T extends QueryResultRow>(query: QueryConfig) => {
        const start = Date.now();
        const response = await pool.query<T>(query);
        const duration = Date.now() - start;
    
        console.log('executed query', {text: query.text, duration, rows: response.rowCount });
    
        return response;
    },

    connectAClient: () => pool.connect(),

    release: (client: PoolClient) => client.release(),

    close: () => pool.end(),
};
