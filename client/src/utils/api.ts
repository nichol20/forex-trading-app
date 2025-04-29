import { Exchange, Rates, SortableField } from "../types/exchange";
import { User, Wallet } from "../types/user";
import { Currency } from "./currency";
import { http } from "./http";
import { SortBy, sortByToExchangeKeyMap } from "./params";

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

interface GetExchangeHistoryArgs {
    page?: number;
    limit?: number;
    sortBy?: SortBy;
    sortOrder?: "asc" | "desc";
}

interface GetExchangeHistoryResponse {
    history: Exchange[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
}

export const getExchangeHistory = async (
    args?: GetExchangeHistoryArgs
): Promise<GetExchangeHistoryResponse> => {
    const sortBy: SortableField = args?.sortBy
        ? sortByToExchangeKeyMap[args.sortBy]
        : "exchangedAt";
    const queryObj = args
        ? {
              ...args,
              sortBy,
          }
        : {};

    const searchParams = new URLSearchParams(Object.entries(queryObj));
    const res = await http.get<GetExchangeHistoryResponse>(
        "/history?" + searchParams.toString()
    );
    return res.data;
};

export const getExchangeRates = async (base: Currency): Promise<Rates> => {
    const res = await http.get<Rates>(`/rates?base=${base}`);
    return res.data;
};
