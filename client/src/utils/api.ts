import { Exchange, LatestRateItem, Rates, TimeSeries } from "../types/exchange";
import { User, Wallet } from "../types/user";
import { Currency } from "./currency";
import { http } from "../lib/api";
import { removeNullsDeep } from "./object";
import { SortBy } from "./params";

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

export const logout = async (): Promise<void> => {
    await http.post("/logout")
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

export interface Filters {
    start?: string | null;
    end?: string | null;
    from?: Currency | null;
    to?: Currency | null;
    minRate?: number | null;
    maxRate?: number | null;
    minAmount?: number | null;
    maxAmount?: number | null;
    minOutput?: number | null;
    maxOutput?: number | null;
}

interface GetExchangeHistoryArgs {
    page?: number;
    limit?: number;
    sortBy?: SortBy;
    sortOrder?: "asc" | "desc";
    filters?: Filters;
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
    let query = removeNullsDeep(args ?? {})
    query = { ...query, ...query.filters, filters: undefined }
    
    const searchParams = new URLSearchParams(Object.entries(query as Object));
    const res = await http.get<GetExchangeHistoryResponse>(
        "/history?" + searchParams.toString()
    );
    return res.data;
};

export const getExchangeRates = async (base: Currency): Promise<Rates> => {
    const res = await http.get<Rates>(`/rates?base=${base}`);
    return res.data;
};

export const getLatestRates = async (base: Currency): Promise<LatestRateItem[]> => {
    const res = await http.get<LatestRateItem[]>(`/latest-rates?base=${base}`);
    return res.data
}

export const getTimeSeries = async (
    from: Currency, 
    to: Currency, 
    start: string, 
    end: string
) => {
    const query = new URLSearchParams({ from, to, start, end })
    const res = await http.get<TimeSeries>(`/time-series?${query.toString()}`)

    return res.data
}