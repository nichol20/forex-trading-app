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
