import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { getEnv } from "../../config/env";
import { BadRequestError, UnauthorizedError } from "../../helpers/apiError";
import { User } from "../../types/user";
import { loginSchema } from "../../validators/auth";
import { findUserByEmail } from "../../repositories/userRepository";

export const login = async (req: Request, res: Response<User>) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { email, password } = parsed.data;

    const user = await findUserByEmail(email);

    if (!user) throw new UnauthorizedError("Email or password incorrect!");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedError("Email or password incorrect!");

    const token = jwt.sign({}, getEnv().JWT_SECRET, {
        subject: user.id,
        expiresIn: "1d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    const { password: _, created_at, hubspot_contact_id, ...partialUser } = user;

    res.status(200).json({
        ...partialUser,
        createdAt: created_at,
        hubspotContactId:hubspot_contact_id
    });

    return;
};
