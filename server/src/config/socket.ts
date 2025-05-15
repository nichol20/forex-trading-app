import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { redisClient } from "./redis";

export const startWebSocketServer = async (httpServer: http.Server) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const jwtToken = socket.handshake.headers.cookie
            ?.split("; ")
            .find((cookie) => cookie.startsWith("jwt="))
            ?.split("=")[1];

        if (!jwtToken) {
            return next(new Error("Authentication error"));
        }

        try {
            const { sub } = jwt.verify(jwtToken, process.env.JWT_SECRET!);
            socket.userId = String(sub)
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", async (socket) => {
        console.log("New client connected");

        await redisClient.set(`socket:${socket.userId}`, socket.id);

        socket.on("disconnect", async reason => {
            await redisClient.del(`socket:${socket.userId}`);
            console.log("Client disconnected! Reason: " + reason);
        });
    });

    return io;
};
