import express from "express";

import { login } from "../controllers/auth/login";
import { signup } from "../controllers/auth/signup";

export const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
