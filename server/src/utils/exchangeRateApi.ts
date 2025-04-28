import axios from "axios";

import { env } from "../app";
import { Currency } from "./currency";
import { ExchangeRateResponse, Rates } from "../types/exchangeRateApi";

const exchangeApiUrl = `https://api.beta.fastforex.io`;

export const fetchExchangeRate = async (
    base: Currency,
    currencies: Currency[]
): Promise<{ rates: Rates }> => {
    const searchParams = new URLSearchParams({
        from: base,
        to: currencies.join(","),
        api_key: env.EXCHANGERATE_API_KEY,
    });
    const { data } = await axios.get<ExchangeRateResponse>(
        `${exchangeApiUrl}/fetch-multi?${searchParams.toString()}`
    );

    if (!("results" in data)) {
        throw new Error("Error requesting base code rate: " + data);
    }

    data.results[base] = 1;

    return {
        rates: data.results,
    };
};
