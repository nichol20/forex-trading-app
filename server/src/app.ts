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
import { connectToRedis } from "./config/redis";
import { startExchangeQueue } from "./config/queue";

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

        server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error: any) {
        console.error(error?.message);
        process.exit();
    }
};


main();
