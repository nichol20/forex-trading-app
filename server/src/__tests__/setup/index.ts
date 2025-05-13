import { startPostgresContainer } from "./postgres";
import { startRedisContainer } from "./redis";

module.exports = async () => {
    global.__REDIS_URI__ = (await startRedisContainer()).uri;
    process.env.REDIS_URI = global.__REDIS_URI__;
    global.__POSTGRES_URI__ = (await startPostgresContainer()).uri;
    process.env.POSTGRES_URI = global.__POSTGRES_URI__;
};
