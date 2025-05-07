import { Request, Response } from "express";

import { BadRequestError } from "../../helpers/apiError";
import { addToWalletSchema } from "../../validators/user";
import { addToWallet as addToWalletQuery } from "../../repositories/userRepository"

export const addToWallet = async (req: Request, res: Response) => {
    const parsed = addToWalletSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }
    const { amount, currency } = parsed.data;

    const userId = req.userId;
    const user = await addToWalletQuery(currency, amount, userId!);

    res.status(200).json(user.wallet);
    return;
};
