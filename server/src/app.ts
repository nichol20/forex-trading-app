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
import { shutdown } from "./shutdown";
import { startExchangeQueue } from "./utils/queue";

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
        
        const io = await startWebSocketServer(server);
        startExchangeQueue(io).catch(console.error); // fire-and-forget mode
        startBroadcasts(io);

        const httpServer = server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

        // Force‐exit after 30s
        const FORCE_TIMEOUT = 30_000;
        const onSignal = (sig: NodeJS.Signals) => {
            shutdown(sig, httpServer, io).catch(console.error);
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
