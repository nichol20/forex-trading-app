import { Request, Response } from "express";

import { BadRequestError } from "../../helpers/apiError";
import { addToWalletSchema } from "../../validators/user";
import { addToWallet as addToWalletQuery } from "../../repositories/userRepository"
import { createDealWithContactAssociation } from "../../services/hubspotApi";

export const addToWallet = async (req: Request, res: Response) => {
    const parsed = addToWalletSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }
    const { amount, currency } = parsed.data;

    const userId = req.userId;
    const user = await addToWalletQuery(currency, amount, userId!);
    await createDealWithContactAssociation(user.hubspot_contact_id, {
        amount,
        dealname: `${user.name} added funds`,
        dealstage: "funds_received",
        pipeline: "default",
    })

    res.status(200).json(user.wallet);
    return;
};
