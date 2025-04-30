import { date, z } from "zod";
import { Currency } from "../utils/currency";
import { SortBy, SortOrder } from "../utils/query";

export const addToWalletSchema = z.object({
    amount: z.number({ required_error: "amount is required" }).positive(),
    currency: z.nativeEnum(Currency, {
        required_error: "currency is required",
        invalid_type_error: "We do not support this currency",
    }),
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
    sortBy: z.nativeEnum(SortBy).optional().default(SortBy.DATE),
    sortOrder: z.nativeEnum(SortOrder).optional().default(SortOrder.DESC),
    start: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine(
            (val) =>
                val ? val instanceof Date && !isNaN(val.getTime()) : true,
            {
                message: "Invalid date format",
            }
        ),
    end: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine(
            (val) =>
                val ? val instanceof Date && !isNaN(val.getTime()) : true,
            {
                message: "Invalid date format",
            }
        ),
    from: z
        .nativeEnum(Currency, {
            invalid_type_error: "We do not support this currency",
        })
        .optional(),
    to: z
        .nativeEnum(Currency, {
            invalid_type_error: "We do not support this currency",
        })
        .optional(),
    minRate: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => (val ? !isNaN(val) && val > 0 : true), {
            message: "minRate must be a positive number",
        }),
    maxRate: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => (val ? !isNaN(val) && val > 0 : true), {
            message: "maxRate must be a positive number",
        }),
    minAmount: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => (val ? !isNaN(val) && val > 0 : true), {
            message: "minAmount must be a positive number",
        }),
    maxAmount: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => (val ? !isNaN(val) && val > 0 : true), {
            message: "maxAmount must be a positive number",
        }),
    minOutput: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => (val ? !isNaN(val) && val > 0 : true), {
            message: "minOutput must be a positive number",
        }),
    maxOutput: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => (val ? !isNaN(val) && val > 0 : true), {
            message: "maxOutput must be a positive number",
        }),
});
