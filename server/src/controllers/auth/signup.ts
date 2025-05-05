import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { BadRequestError, ConflictError } from "../../helpers/apiError";
import db from "../../config/db";
import { getEnv } from "../../config/env";
import { User, UserDocument } from "../../types/user";
import { signupSchema } from "../../validators/auth";

const saltRounds = 10;

export const signup = async (req: Request, res: Response<User>) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { name, email, password } = parsed.data;

    const userCollection = db.getCollection<UserDocument>("users");
    const user = await userCollection.findOne({ email });

    if (user) throw new ConflictError("This email already exists!");

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser: UserDocument = {
        name,
        email,
        password: hashedPassword,
        wallet: {
            GBP: 0,
            USD: 0,
        },
        createdAt: new Date().toISOString(),
    };

    const { insertedId } = await userCollection.insertOne(newUser);

    const token = jwt.sign({}, getEnv().JWT_SECRET, {
        subject: insertedId.toString(),
        expiresIn: "1d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    const { password: _, ...partialUser } = newUser;

    res.status(201).json({
        id: insertedId.toString(),
        ...partialUser,
    });
    return;
};
