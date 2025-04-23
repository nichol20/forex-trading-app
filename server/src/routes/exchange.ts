import express from "express";

import { mustBeAuthenticated } from "../middlewares/mustBeAuthenticated";
import { getRates } from "../controllers/exchange/getRates";
import { exchangeCurrency } from "../controllers/exchange/exchangeCurrency";
import { getHistory } from "../controllers/user/getHistory";

export const exchangeRoutes = express.Router();

exchangeRoutes.get("/rates", mustBeAuthenticated, getRates);
exchangeRoutes.post("/exchange", mustBeAuthenticated, exchangeCurrency);
exchangeRoutes.get("/history", mustBeAuthenticated, getHistory);
