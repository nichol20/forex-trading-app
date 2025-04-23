import axios from "axios";

import { Currency } from "./currency";
import {
    ExchangeRateResponse,
    SuccessfulExchangeRateResponse,
} from "../types/exchangeRateApi";

const exchangeApiUrl = "https://v6.exchangerate-api.com/v6";

export const fetchExchangeRate = async (
    baseCode: Currency
): Promise<SuccessfulExchangeRateResponse> => {
    const { data } = await axios.get<ExchangeRateResponse>(
        `${exchangeApiUrl}/${process.env.EXCHANGERATE_API_KEY}/latest/${baseCode}`
    );

    if (data.result === "error") {
        throw new Error(
            "Error requesting base code rate: " + data["error-type"]
        );
    }

    return data;
};
