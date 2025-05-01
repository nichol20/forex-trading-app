import { Request, Response } from "express";
import { User, UserDocument } from "../../types/user";
import { ObjectId } from "mongodb";
import db from "../../config/db";
import { InternalServerError } from "../../helpers/apiError";

export const getProfile = async (req: Request, res: Response<User>) => {
    const userId = req.userId;
    const userCollection = db.getCollection<UserDocument>("users");
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        console.error("error finding authenticated user");
        throw new InternalServerError();
    }

    const { _id, password, ...partialUser } = user;

    res.status(200).json({
        id: _id.toString(),
        ...partialUser,
    });

    return;
};
