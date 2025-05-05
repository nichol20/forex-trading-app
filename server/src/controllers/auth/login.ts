import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import db from "../../config/db";
import { getEnv } from "../../config/env";
import { BadRequestError, UnauthorizedError } from "../../helpers/apiError";
import { User, UserDocument } from "../../types/user";
import { loginSchema } from "../../validators/auth";

export const login = async (req: Request, res: Response<User>) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { email, password } = parsed.data;

    const userCollection = db.getCollection<UserDocument>("users");
    const user = await userCollection.findOne({ email });

    if (!user) throw new UnauthorizedError("Email or password incorrect!");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedError("Email or password incorrect!");

    const token = jwt.sign({}, getEnv().JWT_SECRET, {
        subject: user._id.toString(),
        expiresIn: "1d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    const { _id, password: _, ...partialUser } = user;

    res.status(200).json({
        id: _id.toString(),
        ...partialUser,
    });

    return;
};
