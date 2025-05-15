import { Server } from "socket.io";
import { Queue } from "../config/queue";
import { Currency } from "./currency";
import { createExchange } from "../repositories/exchangeRepository";
import { redisClient } from "../config/redis";
import { Exchange } from "../types/exchange";

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
            
            io.to(socketId).emit(`exchange-made`, {
                id: exchangeRow.id,
                userId: exchangeRow.user_id,
                exchangedAt: exchangeRow.exchanged_at,
                fromCurrency: exchangeRow.from_currency,
                toCurrency: exchangeRow.to_currency,
                fromAmount: parseFloat(exchangeRow.from_amount),
                toAmount: parseFloat(exchangeRow.to_amount),
                exchangeRate: parseFloat(exchangeRow.exchange_rate),
                hubspotDealId: exchangeRow.hubspot_deal_id
            } as Exchange)
        } catch (error) {
            io.to(socketId).emit(`exchange-failed`, "exchangeFailed")
            console.error("Failed exchange", error)
        }
    })
}

export const stopExchangeQueue = async () => {
    await ExchangeQueue.shutdown()
}