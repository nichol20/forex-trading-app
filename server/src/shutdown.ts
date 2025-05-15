import http from "http";
import { Server } from "socket.io";

import { redisClient } from "./config/redis";
import db from "./config/db";
import { stopExchangeQueue } from "./utils/queue";

export const shutdown = async (signal: string, httpServer: http.Server, io: Server) => {
    console.log(`\n${signal} received: starting graceful shutdown…`);

    // Stop accepting new connections
    httpServer.close(() => {
        console.log('HTTP server closed.');
    });

    // Stop the WebSocket server
    try {
        await io.close();
        console.log('WebSocket server closed.');
    } catch (err) {
        console.error('Error closing WebSocket server', err);
    }

    // Stop job queue
    try {
        await stopExchangeQueue();
        console.log('Exchange queue stopped.');
    } catch (err) {
        console.error('Error stopping queue', err);
    }

    // Disconnect DB
    try {
        await db.close();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Error closing DB connection', err);
    }

    // Disconnect Redis and clean 
    try {
        await redisClient.flushDb(); 
        await redisClient.quit();
        console.log('Redis client disconnected.');
    } catch (err) {
        console.error('Error quitting Redis client', err);
    }

    console.log('Cleanup finished, exiting now.');
    process.exit(0);
};