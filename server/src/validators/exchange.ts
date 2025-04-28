import { z } from "zod";
import { Currency } from "../utils/currency";

export const exchangeCurrencySchema = z.object({
    fromCurrency: z.nativeEnum(Currency, {
        required_error: "'fromCurrency' field is required",
        invalid_type_error: "We do not support this currency",
    }),
    toCurrency: z.nativeEnum(Currency, {
        required_error: "'toCurrency' field is required",
        invalid_type_error: "We do not support this currency",
    }),
    amount: z.number({ required_error: "amount is required" }).positive(),
});

export const getHistoryQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: "Page must be a positive integer",
        }),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: "Limit must be a positive integer",
        }),
    sortBy: z
        .enum([
            "exchangedAt",
            "fromCurrency",
            "toCurrency",
            "fromAmount",
            "toAmount",
            "exchangeRate",
        ])
        .optional()
        .default("exchangedAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
