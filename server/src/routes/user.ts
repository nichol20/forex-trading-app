import express from "express";

import { addToWallet } from "../controllers/user/addToWallet";
import { getProfile } from "../controllers/user/getProfile";
import { mustBeAuthenticated } from "../middlewares/mustBeAuthenticated";

export const userRoutes = express.Router();

userRoutes.post("/wallet", mustBeAuthenticated, addToWallet);
userRoutes.get("/profile", mustBeAuthenticated, getProfile);
