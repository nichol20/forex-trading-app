import { Request, Response } from "express";

export const logout = (req: Request, res: Response) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
    });
    res.sendStatus(200);
    return;
}