import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ForbiddenError, UnauthorizedError } from "../helpers/apiError";

export const mustBeAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const jwtToken = req.cookies?.jwt;

    if (!jwtToken)
        return next(
            new UnauthorizedError("a token is required to access this route")
        );

    try {
        const { sub } = jwt.verify(jwtToken, process.env.JWT_SECRET!);
        req.userId = String(sub);

        return next();
    } catch (error) {
        next(new ForbiddenError("Invalid token"));
    }
};
