// __tests__/api.test.ts or same directory as the API module
import {
    signup,
    login,
    logout,
    getUser,
    addToWallet,
    exchangeCurrencies,
    getExchangeHistory,
    getExchangeRates,
    getTimeSeries,
} from "./api"; // Replace with actual path

import { http } from "./http";
import { Currency } from "./currency";

jest.mock("./http", () => ({
    http: {
        post: jest.fn(),
        get: jest.fn(),
    },
}));

describe("API functions", () => {
    const mockUser = { id: "1", name: "Test", email: "test@example.com" };
    const mockWallet = { balance: 1000, currency: "USD" };
    const mockExchange = {
        from: "USD",
        to: "EUR",
        amount: 100,
        rate: 0.9,
        output: 90,
    };
    const mockRates = { base: "USD", rates: { EUR: 0.9 } };
    const mockTimeSeries = {
        from: "USD",
        to: "EUR",
        rates: [{ date: "2024-01-01", rate: 0.9 }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("signup() sends correct data and returns user", async () => {
        (http.post as jest.Mock).mockResolvedValue({ data: mockUser });

        const result = await signup({
            name: "Test",
            email: "test@example.com",
            password: "123456",
        });

        expect(http.post).toHaveBeenCalledWith("/signup", expect.any(Object));
        expect(result).toEqual(mockUser);
    });

    it("login() sends credentials and returns user", async () => {
        (http.post as jest.Mock).mockResolvedValue({ data: mockUser });

        const result = await login("test@example.com", "123456");

        expect(http.post).toHaveBeenCalledWith("/login", {
            email: "test@example.com",
            password: "123456",
        });
        expect(result).toEqual(mockUser);
    });

    it("logout() calls the logout endpoint", async () => {
        (http.post as jest.Mock).mockResolvedValue({});

        await logout();

        expect(http.post).toHaveBeenCalledWith("/logout");
    });

    it("getUser() returns current user data", async () => {
        (http.get as jest.Mock).mockResolvedValue({ data: mockUser });

        const result = await getUser();

        expect(http.get).toHaveBeenCalledWith("/profile");
        expect(result).toEqual(mockUser);
    });

    it("addToWallet() sends amount and currency and returns wallet", async () => {
        (http.post as jest.Mock).mockResolvedValue({ data: mockWallet });

        const result = await addToWallet(100, Currency.USD);

        expect(http.post).toHaveBeenCalledWith("/wallet", {
            amount: 100,
            currency: Currency.USD,
        });
        expect(result).toEqual(mockWallet);
    });

    it("exchangeCurrencies() posts correct data and returns exchange result", async () => {
        (http.post as jest.Mock).mockResolvedValue({ data: mockExchange });

        const result = await exchangeCurrencies(
            Currency.USD,
            Currency.GBP,
            100
        );

        expect(http.post).toHaveBeenCalledWith("/exchange", {
            fromCurrency: Currency.USD,
            toCurrency: Currency.GBP,
            amount: 100,
        });
        expect(result).toEqual(mockExchange);
    });

    it("getExchangeHistory() calls with cleaned filters and returns data", async () => {
        const mockResponse = {
            history: [mockExchange],
            totalItems: 1,
            currentPage: 1,
            totalPages: 1,
        };
        (http.get as jest.Mock).mockResolvedValue({ data: mockResponse });

        const result = await getExchangeHistory({
            filters: { from: Currency.USD, to: Currency.GBP, start: null },
            page: 1,
        });

        expect(http.get).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
    });

    it("getExchangeRates() returns rates for a base currency", async () => {
        (http.get as jest.Mock).mockResolvedValue({ data: mockRates });

        const result = await getExchangeRates(Currency.USD);

        expect(http.get).toHaveBeenCalledWith("/rates?base=USD");
        expect(result).toEqual(mockRates);
    });

    it("getTimeSeries() returns historical data between dates", async () => {
        (http.get as jest.Mock).mockResolvedValue({ data: mockTimeSeries });

        const result = await getTimeSeries(
            Currency.USD,
            Currency.GBP,
            "2024-01-01",
            "2024-01-31"
        );

        expect(http.get).toHaveBeenCalledWith(
            expect.stringContaining("/time-series?")
        );
        expect(result).toEqual(mockTimeSeries);
    });
});
