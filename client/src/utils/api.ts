import { Exchange, Rates } from "../types/exchange";
import { User, Wallet } from "../types/user";
import { Currency } from "./currency";
import { http } from "./http";

interface SignupArgs {
    name: string;
    email: string;
    password: string;
}

export const signup = async (args: SignupArgs): Promise<User> => {
    const res = await http.post<User>("/signup", args);
    return res.data;
};

export const login = async (email: string, password: string): Promise<User> => {
    const res = await http.post<User>("/login", { email, password });
    return res.data;
};

export const getUser = async (): Promise<User> => {
    const res = await http.get<User>("/profile");
    return res.data;
};

export const addToWallet = async (
    amount: number,
    currency: Currency
): Promise<Wallet> => {
    const res = await http.post<Wallet>("/wallet", {
        amount,
        currency,
    });
    return res.data;
};

export const exchangeCurrencies = async (
    from: Currency,
    to: Currency,
    amount: number
): Promise<Exchange> => {
    const res = await http.post<Exchange>("/exchange", {
        fromCurrency: from,
        toCurrency: to,
        amount,
    });
    return res.data;
};

export const getExchangeHistory = async (): Promise<Exchange[]> => {
    const res = await http.get<Exchange[]>("/history");
    return res.data;
};

export const getExchangeRates = async (base: Currency): Promise<Rates> => {
    const res = await http.get<Rates>(`/rates?base=${base}`);
    return res.data;
};
