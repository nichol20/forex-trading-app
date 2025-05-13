import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

import { login } from "./login";
import { BadRequestError, UnauthorizedError } from "../../helpers/apiError";
import { validUser } from "../../../jest.setup-env";

jest.mock("jsonwebtoken");
jest.mock("bcrypt", () => ({
    compare: jest.fn()
}))

describe("login controller", () => {
    const mockRequest = (body: any): Partial<Request> => ({ body });
    const mockResponse = (): Partial<Response> => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.cookie = jest.fn();
        return res;
    };

    it("should throw BadRequestError if validation fails", async () => {
        const req = mockRequest({
            email: "not-an-email",
            password: "",
        }) as Request;
        const res = mockResponse() as Response;

        await expect(login(req, res)).rejects.toThrow(BadRequestError);
    });

    it("should throw UnauthorizedError if user is not found", async () => {
        const req = mockRequest({
            email: "test@test.com",
            password: "secret",
        }) as Request;
        const res = mockResponse() as Response;

        await expect(login(req, res)).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError if password is incorrect", async () => {
        const req = mockRequest({
            email: validUser.email,
            password: "wrong",
        }) as Request;
        const res = mockResponse() as Response;

        await expect(login(req, res)).rejects.toThrow(UnauthorizedError);
    });

    it("should set JWT cookie and return user data", async () => {
        const req = mockRequest({
            email: validUser.email,
            password: validUser.password,
        }) as Request;
        const res = mockResponse() as Response;

        (bcrypt.compare as jest.Mock).mockReturnValue(true);
        (jwt.sign as jest.Mock).mockReturnValue("mock-token");

        await login(req, res);

        expect(res.cookie).toHaveBeenCalledWith(
            "jwt",
            "mock-token",
            expect.objectContaining({
                httpOnly: true,
                secure: true,
            })
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                email: validUser.email,
            })
        );
    });
});
