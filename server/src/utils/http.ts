import axios from "axios";

export const hubspotClient = axios.create({
    baseURL: process.env.HUBSPOT_API_URL,
    headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
    },
});

export const exchangeRateAPIClient = axios.create({
    baseURL: process.env.EXCHANGERATE_API_URL,
})