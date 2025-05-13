import { createClient, RedisClientType } from 'redis';

export let redisClient: RedisClientType

export const connectToRedis = async () => {
    console.log(process.env.REDIS_URI)
    redisClient = createClient({
        url: process.env.REDIS_URI || 'redis://localhost:6379'
    });

    redisClient.on('error', err => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log("Connected successfully to Redis");
}

export const disconnectFromRedis = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.quit();
        console.log("Disconnected successfully from Redis");
    }
};