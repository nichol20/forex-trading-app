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

export const getTimeSeriesQuerySchema = z.object({
    from: z.nativeEnum(Currency, {
        required_error: "'from' query is required",
        invalid_type_error: "We do not support this currency",
    }),
    to: z.nativeEnum(Currency, {
        required_error: "'to' query is required",
        invalid_type_error: "We do not support this currency",
    }),
    start: z
        .string({
            required_error: "'start' query is required",
        })
        .transform((val) => new Date(val))
        .refine(
            (val) => val instanceof Date && !isNaN(val.getTime()), 
            { message: "Invalid date format" }
        ),
    end: z
        .string({
            required_error: "'end' query is required",
        })
        .transform((val) => new Date(val))
        .refine(
            (val) => val instanceof Date && !isNaN(val.getTime()), 
            { message: "Invalid date format" }
        )
})