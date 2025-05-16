import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { BadRequestError, ConflictError } from "../../helpers/apiError";
import { getEnv } from "../../config/env";
import { User } from "../../types/user";
import { signupSchema } from "../../validators/auth";
import { createUser, findUserByEmail } from "../../repositories/userRepository";
import { createContact } from "../../services/hubspotApi";

const saltRounds = 10;

export const signup = async (req: Request, res: Response<User>) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { name, email, password } = parsed.data;

    const user = await findUserByEmail(email);

    if (user) throw new ConflictError("This email already exists!");

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const contactInfo = await createContact(email, name);

    const { password: _, created_at, ...partialUser } = await createUser({
        name,
        email,
        password: hashedPassword,
        wallet: {
            GBP: 0,
            USD: 0,
            EUR: 0,
            BRL: 0,
            JPY: 0
        },
        hubspot_contact_id: contactInfo.id
    })

    const token = jwt.sign({}, getEnv().JWT_SECRET, {
        subject: partialUser.id,
        expiresIn: "1d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    res.status(201).json({
        ...partialUser,
        createdAt: created_at,
        hubspotContactId: contactInfo.id
    });
    return;
};
