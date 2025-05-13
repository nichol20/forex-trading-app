import { stopPostgresContainer } from "./postgres";
import { stopRedisContainer } from "./redis";

module.exports = async () => {
    await stopPostgresContainer();
    await stopRedisContainer();
};
