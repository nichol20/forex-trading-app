import express from "express";

import { mustBeAuthenticated } from "../middlewares/mustBeAuthenticated";
import { getRates } from "../controllers/exchange/getRates";
import { exchangeCurrency } from "../controllers/exchange/exchangeCurrency";
import { getHistory } from "../controllers/user/getHistory";
import { getTimeSeries } from "../controllers/exchange/getTimeSeries";
import { getLatestRates } from "../controllers/exchange/getLatestRates";

export const exchangeRoutes = express.Router();

exchangeRoutes.post("/exchange", mustBeAuthenticated, exchangeCurrency);
exchangeRoutes.get("/rates", mustBeAuthenticated, getRates);
exchangeRoutes.get("/time-series", mustBeAuthenticated, getTimeSeries)
exchangeRoutes.get("/history", mustBeAuthenticated, getHistory);
exchangeRoutes.get("/latest-rates", mustBeAuthenticated, getLatestRates)