import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import TradeHistory from "../pages/TradeHistory"
import { getExchangeHistory } from "../utils/api"
import { Exchange } from "../types/exchange"
import { MemoryRouter, Route, Routes } from "react-router"
import { Currency } from "../utils/currency"

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

    it("handles sort column click and updates sort direction", async () => {
        render(<TradeHistory />, { wrapper: MemoryRouter })

        const dateHeader = screen.getByText("Date");
        fireEvent.click(dateHeader);

        await waitFor(() => {
            expect(getExchangeHistory).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    sortBy: "date"
                })
            );
        });
    });

    it("calls API with expected filters and query params", async () => {
        render(
            <MemoryRouter initialEntries={["/trade-history?page=1&limit=5&sortBy=amount&sortOrder=desc&from=USD&to=GBP"]}>
                <Routes>
                    <Route path="/trade-history" element={<TradeHistory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(getExchangeHistory).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    limit: 5,
                    sortBy: "amount",
                    sortOrder: "desc",
                    filters: expect.objectContaining({
                        from: Currency.USD,
                        to: Currency.GBP
                    })
                })
            );
        });
    })
})
