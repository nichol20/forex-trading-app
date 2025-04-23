import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string({ required_error: "field 'email' is required" })
        .email("Invalid email format"),
    password: z.string({ required_error: "field 'password' is required" }),
});

export const signupSchema = z.object({
    name: z
        .string({ required_error: "field 'name' is required" })
        .nonempty("field 'name' is required"),
    email: z
        .string({ required_error: "field 'email' is required" })
        .email("Invalid email format"),
    password: z
        .string({ required_error: "field 'password' is required" })
        .min(6, "password must be at least 6 characters"),
});
