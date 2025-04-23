import { z } from "zod";

const envSchema = z.object({
    JWT_SECRET: z
        .string({ required_error: "JWT_SECRET is required" })
        .nonempty("JWT_SECRET is required"),
    FRONTEND_URL: z
        .string({ required_error: "FRONTEND_URL is required" })
        .nonempty("FRONTEND_URL is required"),
    MONGO_URI: z
        .string({ required_error: "MONGO_URI is required" })
        .nonempty("MONGO_URI is required"),
    MONGO_USERNAME: z
        .string({ required_error: "MONGO_USERNAME is required" })
        .nonempty("MONGO_USERNAME is required"),
    MONGO_PASSWORD: z
        .string({ required_error: "MONGO_PASSWORD is required" })
        .nonempty("MONGO_PASSWORD is required"),
});

export const checkEnv = () => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error("Invalid environment variables:");
        result.error.errors.forEach((err) => {
            console.error(`- ${err.message}`);
        });
        process.exit(1);
    }

    return result.data;
};
