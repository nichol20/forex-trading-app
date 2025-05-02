import express from "express";

import { login } from "../controllers/auth/login";
import { signup } from "../controllers/auth/signup";
import { logout } from "../controllers/auth/logout";

export const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout)