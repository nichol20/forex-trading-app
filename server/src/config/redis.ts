import { createClient, RedisClientType } from 'redis';

export let redisClient: RedisClientType

export const connectToRedis = async () => {
    redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', err => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log("Connected successfully to Redis");
}