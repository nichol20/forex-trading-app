import { z } from "zod";

const envSchema = z.object({
    JWT_SECRET: z
        .string({ required_error: "JWT_SECRET is required" })
        .nonempty("JWT_SECRET is required"),
    FRONTEND_URL: z
        .string({ required_error: "FRONTEND_URL is required" })
        .nonempty("FRONTEND_URL is required"),
    POSTGRES_URI: z
        .string({ required_error: "POSTGRES_URI is required" })
        .nonempty("POSTGRES_URI is required"),
    EXCHANGERATE_API_KEY: z
        .string({ required_error: "EXCHANGERATE_API_KEY is required" })
        .nonempty("EXCHANGERATE_API_KEY is required"),
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

export const getEnv = () => {
    return envSchema.parse(process.env);
}