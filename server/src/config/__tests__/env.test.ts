import { checkEnv } from "../env";

describe("checkEnv", () => {
    const originalEnv = process.env;
    const originalExit = process.exit;
    const originalConsoleError = console.error;

    beforeEach(() => {
        jest.resetModules(); // Clears any cache
        process.env = { ...originalEnv }; // Clone original env
        console.error = jest.fn();
        process.exit = jest.fn() as never;
    });

    afterEach(() => {
        process.env = originalEnv;
        process.exit = originalExit;
        console.error = originalConsoleError;
    });

    it("should pass when all required env variables are set", () => {
        process.env.JWT_SECRET = "secret";
        process.env.FRONTEND_URL = "http://localhost:3000";
        process.env.MONGO_URI = "mongodb://localhost:27017";
        process.env.EXCHANGERATE_API_KEY = "key";

        expect(checkEnv()).toEqual({
            EXCHANGERATE_API_KEY: "key",
            JWT_SECRET: "secret",
            FRONTEND_URL: "http://localhost:3000",
            MONGO_URI: "mongodb://localhost:27017",
        });

        expect(console.error).not.toHaveBeenCalled();
        expect(process.exit).not.toHaveBeenCalled();
    });

    it("should fail and call process.exit if an env var is missing", () => {
        process.env = {}; // no env vars

        checkEnv();

        expect(console.error).toHaveBeenCalled();
        expect((console.error as jest.Mock).mock.calls[0][0]).toMatch(
            /Invalid environment variables:/
        );
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should fail if one of the env vars is empty", () => {
        process.env.JWT_SECRET = "";
        process.env.FRONTEND_URL = "http://localhost:3000";
        process.env.MONGO_URI = "mongodb://localhost:27017";
        process.env.EXCHANGERATE_API_KEY = "key";

        checkEnv();

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("JWT_SECRET is required")
        );
        expect(process.exit).toHaveBeenCalledWith(1);
    });
});
