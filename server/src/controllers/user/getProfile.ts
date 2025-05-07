import { Request, Response } from "express";
import { User } from "../../types/user";
import { InternalServerError } from "../../helpers/apiError";
import { findUserById } from "../../repositories/userRepository";

export const getProfile = async (req: Request, res: Response<User>) => {
    const userId = req.userId;
    
    const user = await findUserById(userId!);

    if (!user) {
        console.error("error finding authenticated user");
        throw new InternalServerError();
    }

    const { password, created_at, ...partialUser } = user

    res.status(200).json({
        ...partialUser,
        createdAt: created_at
    });
    
    return;
};
