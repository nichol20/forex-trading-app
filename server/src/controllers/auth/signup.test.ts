import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { signup } from "./signup";
import { ConflictError, BadRequestError } from "../../helpers/apiError";
import { validUser } from "../../../jest.setup-env";

jest.mock("jsonwebtoken");
jest.mock("bcrypt", () => ({
    hash: jest.fn()
}));
jest.mock("../../services/hubspotApi", () => ({
    createContact: () => ({ id: "7098907097" })
}))

const mockRequest = (body: any): Partial<Request> => ({ body });
const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn();
    return res;
};

describe("signup controller", () => {
    beforeAll(() => {
        process.env.JWT_SECRET = "test";
    });

    it("should throw BadRequestError if validation fails", async () => {
        const req = mockRequest({
            email: "bad-email",
            password: "",
        }) as Request;
        const res = mockResponse() as Response;

        await expect(signup(req, res)).rejects.toThrow(BadRequestError);
    });

    it("should throw ConflictError if user already exists", async () => {
        const req = mockRequest({
            name: validUser.name,
            email: validUser.email,
            password: validUser.password,
        }) as Request;
        const res = mockResponse() as Response;

        await expect(signup(req, res)).rejects.toThrow(ConflictError);
    });

    it("should hash password, insert user, set cookie and return user data", async () => {
        (jwt.sign as jest.Mock).mockReturnValue("mock-token");
        (bcrypt.hash as jest.Mock).mockReturnValue("hashedpassword");

        const req = mockRequest({
            name: "name",
            email: "email3214132@example.com",
            password: "validpassword",
        }) as Request;
        const res = mockResponse() as Response;

        await signup(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith("validpassword", 10);

        expect(jwt.sign).toHaveBeenCalledWith(
            {},
            expect.any(String),
            expect.objectContaining({
                expiresIn: "1d",
            })
        );

        expect(res.cookie).toHaveBeenCalledWith(
            "jwt",
            "mock-token",
            expect.objectContaining({
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            })
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                wallet: { GBP: 0, USD: 0 },
            })
        );
    });
});
