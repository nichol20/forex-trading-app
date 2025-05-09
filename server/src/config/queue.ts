import { Currency } from "../utils/currency";
import { redisClient } from "./redis";

export class Queue<T extends any> {
    private queueName: string

    constructor(queueName: string) {
        this.queueName = queueName
    }

    async enqueue(id: string, payload: T) {
        const jobData = JSON.stringify([id, payload]);
        await redisClient.rPush(this.queueName, jobData);
        console.log(`Enqueued job to ${this.queueName}:`, payload);
    }

    async process(id: string, handler: (payload: T) => Promise<void>) {
        while(true) {
            const [firstItem] = await redisClient.lRange(this.queueName, 0, 0);
            if(firstItem?.startsWith('["' + id)) {
                const [itemID, payload] = JSON.parse(firstItem);
                console.log(`${this.queueName}: Processing id: ${itemID} payload: ${payload}`);
                await handler(payload as T);
                console.log(`${this.queueName}: processed successfully!`);
                
                await redisClient.lPop(this.queueName);
                break;
            }
            // wait until try again
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    async shutdown() {
        await redisClient.del(this.queueName)
    }
}

interface ExchangePayload {
    fromCurrency: Currency;
    toCurrency: Currency;
    amount: number;
}

export let ExchangeQueue: Queue<ExchangePayload>

export const startExchangeQueue = () => {
    ExchangeQueue = new Queue("exchanges")
}