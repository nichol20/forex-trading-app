import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import http from "http";

import { checkEnv } from "./config/env";
import db from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./routes/auth";
import { mustBeAuthenticated } from "./middlewares/mustBeAuthenticated";
import { exchangeRoutes } from "./routes/exchange";
import { userRoutes } from "./routes/user";
import { startWebSocketServer } from "./config/socket";
import { startBroadcasts } from "./utils/socket";
import { connectToRedis, redisClient } from "./config/redis";
import { startExchangeQueue, stopExchangeQueue } from "./config/queue";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const corsOptions: cors.CorsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/health-check", (req, res) => {
    res.send("Everything is alright!😉");
});

app.get("/auth", mustBeAuthenticated, (req, res) => {
    res.status(200).send("Authenticated✅");
});

app.use(authRoutes);
app.use(userRoutes);
app.use(exchangeRoutes);

app.use(errorHandler);



const main = async () => {
    try {
        checkEnv();
        await db.connectToServer();
        await connectToRedis();
        startExchangeQueue();
        const io = await startWebSocketServer(server);
        startBroadcasts(io);

        const httpServer = server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

        const shutdown = async (signal: string) => {
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

        // Force‐exit after 10s
        const FORCE_TIMEOUT = 10_000;
        const onSignal = (sig: NodeJS.Signals) => {
            shutdown(sig).catch(console.error);
            setTimeout(() => {
                console.error('Could not close in time, forcefully exiting');
                process.exit(1);
            }, FORCE_TIMEOUT);
        };

        process.on('SIGTERM', onSignal);
        process.on('SIGINT',  onSignal);

    } catch (error: any) {
        console.error(error?.message);
        process.exit();
    }
};


main();
