import { Server } from "socket.io";
import { redisClient } from "./redis";
import { RedisClientType } from "redis";
export class Queue<T> {
    private queueName: string;
    private processingQueue: string;
    private running = false;
    private io: Server
    private client: RedisClientType

    constructor(io: Server, queueName: string) {
        this.queueName = queueName;
        this.processingQueue = `${queueName}:processing`;
        this.io = io

        this.client = redisClient.duplicate();
    }

    async enqueue(id: string, payload: T): Promise<void> {
        const jobData = JSON.stringify([id, payload]);
        await redisClient.rPush(this.queueName, jobData);
        console.log(`[${this.queueName}] Enqueued job:`, { id, payload });
    }

    async start(
        handler: (id: string, payload: T) => Promise<void>
    ): Promise<void> {
        await this.client.connect();
        this.running = true;
        console.log(`[${this.queueName}] Worker started.`);

        while (this.running) {
            try {
                // Atomically pop from main queue and push into processing queue
                const jobData = await this.client.blMove(
                    this.queueName,
                    this.processingQueue,
                    "LEFT",
                    "RIGHT",
                    0 // 0 = block indefinitely
                );
                if (!jobData) {
                    // Shouldn't happen with timeout=0, but guard anyway
                    continue;
                }

                const [jobId, payload] = JSON.parse(jobData) as [string, T];
                console.log(`[${this.queueName}] → Handling job ${jobId}`);

                await handler(jobId, payload);

                await this.client.lRem(this.processingQueue, 1, jobData);
                console.log(`[${this.queueName}] ✓ Completed job ${jobId}`);
            } catch (err) {
                console.error(`[${this.queueName}] ✗ error:`, err);
            }
        }

        console.log(`[${this.queueName}] Worker stopped.`);
    }

    stop(): void {
        this.running = false;
    }

    async shutdown(): Promise<void> {
        this.stop();
        await this.client.del(this.queueName);
        await this.client.del(this.processingQueue);
        await this.client.quit();
        console.log(`[${this.queueName}] Queues deleted.`);
    }
}