import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { BadRequestError, InternalServerError } from "../../helpers/apiError";
import { UserDocument } from "../../types/user";
import db from "../../config/db";
import { addToWalletSchema } from "../../validators/user";

export const addToWallet = async (req: Request, res: Response) => {
    const parsed = addToWalletSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }
    const { amount, currency } = parsed.data;

    const userId = req.userId;
    const userCollection = db.getCollection<UserDocument>("users");
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        console.error("error finding authenticated user");
        throw new InternalServerError();
    }

    user.wallet[currency] += amount;

    await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { wallet: user.wallet } }
    );

    res.status(200).json(user.wallet);
};
