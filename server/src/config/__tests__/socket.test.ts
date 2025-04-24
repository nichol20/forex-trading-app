import { startWebSocketServer } from "../socket";
import http from "http";
import jwt from "jsonwebtoken";
import { io as IOClient } from "socket.io-client";

jest.mock("jsonwebtoken");

const PORT = 4001;
const FRONTEND_URL = "http://localhost:3000";

describe("socket", () => {
    let httpServer: http.Server;
    let ioServer: Awaited<ReturnType<typeof startWebSocketServer>>;

    beforeAll(async () => {
        process.env.FRONTEND_URL = FRONTEND_URL;
        process.env.JWT_SECRET = "test-secret";

        httpServer = http.createServer();
        ioServer = await startWebSocketServer(httpServer);
        httpServer.listen(PORT);
    });

    afterAll((done) => {
        ioServer.close();
        httpServer.close(done);
    });

    it("should connect when JWT is valid", (done) => {
        (jwt.verify as jest.Mock).mockReturnValue({ userId: "123" });

        const client = IOClient(`http://localhost:${PORT}`, {
            extraHeaders: {
                cookie: "jwt=validtoken",
            },
        });

        client.on("connect", () => {
            expect(jwt.verify).toHaveBeenCalledWith(
                "validtoken",
                "test-secret"
            );
            client.disconnect();
            done();
        });

        client.on("connect_error", (err) => {
            client.disconnect();
            done(err);
        });
    });

    it("should reject connection when JWT is missing", (done) => {
        const client = IOClient(`http://localhost:${PORT}`, {
            extraHeaders: {
                cookie: "",
            },
        });

        client.on("connect", () => {
            client.disconnect();
            done(new Error("Should not connect without JWT"));
        });

        client.on("connect_error", (err) => {
            expect(err.message).toMatch(/Authentication error/);
            client.disconnect();
            done();
        });
    });

    it("should reject connection when JWT is invalid", (done) => {
        (jwt.verify as jest.Mock).mockImplementationOnce(() => {
            throw new Error("Invalid token");
        });

        const client = IOClient(`http://localhost:${PORT}`, {
            extraHeaders: {
                cookie: "jwt=invalidtoken",
            },
        });

        client.on("connect", () => {
            done(new Error("Should not connect with invalid JWT"));
        });

        client.on("connect_error", (err) => {
            expect(err.message).toMatch(/Invalid token/);
            done();
        });
    });
});
