import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

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
            jwt.verify(jwtToken, process.env.JWT_SECRET!);
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected");

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    return io;
};
