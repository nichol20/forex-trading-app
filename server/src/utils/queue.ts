import { Server } from "socket.io";
import { Queue } from "../config/queue";
import { Currency } from "./currency";
import { createExchange } from "../repositories/exchangeRepository";
import { redisClient } from "../config/redis";

interface ExchangePayload {
    fromCurrency: Currency;
    toCurrency: Currency;
    rate: number;
    amount: number;
}

export let ExchangeQueue: Queue<ExchangePayload>

export const startExchangeQueue = (io: Server) => {
    ExchangeQueue = new Queue(io, "exchanges")
    return ExchangeQueue.start(async (id, payload) => {
        const socketId = await redisClient.get(`socket:${id}`)
        if(!socketId) return

        try {
            console.log("processing...")
            await new Promise(r => setTimeout(r, 5000)); // heavy process

            const exchangeRow = await createExchange({
                userId: id,
                fromCurrency: payload.fromCurrency,
                toCurrency: payload.toCurrency,
                fromAmount: payload.amount,
                exchangeRate: payload.rate,
            }) 

            io.to(socketId).emit(`exchange-made`, exchangeRow)
        } catch (error) {
            io.to(socketId).emit(`exchange-failed`, null)
            console.error("", error)
        }
    })
}

export const stopExchangeQueue = async () => {
    await ExchangeQueue.shutdown()
}