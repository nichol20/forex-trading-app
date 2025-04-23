import { z } from "zod";
import { Currency } from "../utils/currency";

export const addToWalletSchema = z.object({
    amount: z.number({ required_error: "amount is required" }).positive(),
    currency: z.nativeEnum(Currency, {
        required_error: "currency is required",
        invalid_type_error: "We do not support this currency",
    }),
});
