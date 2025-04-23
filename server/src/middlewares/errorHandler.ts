import { ErrorRequestHandler } from "express";
import { ApiError } from "../helpers/apiError";

export const errorHandler: ErrorRequestHandler = async (
    err: Error | ApiError,
    _,
    res,
    __
) => {
    if ("statusCode" in err) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ message: "internal server error." });
};
