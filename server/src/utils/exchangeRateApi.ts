import axios from "axios";

import { Currency } from "./currency";
import {
    ExchangeRateResponse,
    SuccessfulExchangeRateResponse,
} from "../types/exchangeRateApi";

const exchangeApiUrl = "https://api.fxratesapi.com/";

export const fetchExchangeRate = async (
    base: Currency,
    currencies: Currency[]
): Promise<SuccessfulExchangeRateResponse> => {
    const formatedCurrencies = currencies.join(",");
    // query example: ?base=USD&currencies=EUR,GBP,JPY&resolution=1m&amount=1&places=6&format=json
    const { data } = await axios.get<ExchangeRateResponse>(
        `${exchangeApiUrl}/latest?base=${base}&currencies=${formatedCurrencies}&resolution=1m&places=6&format=json`
    );

    if (!data.success) {
        throw new Error("Error requesting base code rate");
    }

    return data;
};
