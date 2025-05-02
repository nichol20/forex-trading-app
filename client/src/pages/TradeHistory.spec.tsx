import { render, screen } from "@testing-library/react"
import TradeHistory from "../pages/TradeHistory"
import { getExchangeHistory } from "../utils/api"
import { Exchange } from "../types/exchange"
import { MemoryRouter } from "react-router"

const mockHistory: Exchange[] = [
    {
        id: "1",
        userId: "1",
        exchangedAt: "2023-12-01T10:00:00Z",
        fromCurrency: "USD",
        toCurrency: "GBP",
        fromAmount: 100,
        exchangeRate: 0.85,
        toAmount: 85,
    },
    {
        id: "2",
        userId: "2",
        exchangedAt: "2023-11-15T10:00:00Z",
        fromCurrency: "GBP",
        toCurrency: "USD",
        fromAmount: 200,
        exchangeRate: 1.2,
        toAmount: 30100,
    },
]

jest.mock("../utils/api", () => ({
    getExchangeHistory: jest.fn()
}))

describe("TradeHistory", () => {
    it("fetches and displays trade history", async () => {
        (getExchangeHistory as jest.Mock).mockResolvedValue({
            history: mockHistory
        })
        render(<TradeHistory />, { wrapper: MemoryRouter })

        for (const exchange of mockHistory) {
            expect(await screen.findAllByText(exchange.fromCurrency)).not.toHaveLength(0);
            expect(await screen.findAllByText(exchange.toCurrency)).not.toHaveLength(0);
            expect(await screen.findAllByText(
                new Date(exchange.exchangedAt).toLocaleDateString()
            )).not.toHaveLength(0);
        }
    })
})
