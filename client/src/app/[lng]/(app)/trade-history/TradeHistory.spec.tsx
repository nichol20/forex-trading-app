import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TradeHistory from "./page";
import { getExchangeHistory } from "@/utils/api";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useT } from "@/i18n/client";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@/utils/api", () => ({
  getExchangeHistory: jest.fn(),
}));

jest.mock("@/i18n/client", () => ({
  useT: jest.fn(),
}));

jest.mock("@/components/Header", () => ({ Header: () => <div data-testid="header" /> }));

jest.mock("@/components/Filters", () => ({ Filters: ({ isOpen }: any) => (
    <div data-testid="filters">{isOpen ? "open" : "closed"}</div>
)}));

const mockHistory = [
    {
        id: "1",
        exchangedAt: "2025-05-07T12:00:00Z",
        fromCurrency: "USD",
        toCurrency: "GBP",
        fromAmount: 100,
        exchangeRate: 0.9,
        toAmount: 90,
    },
    {
        id: "2",
        exchangedAt: "2025-05-06T08:30:00Z",
        fromCurrency: "GBP",
        toCurrency: "USD",
        fromAmount: 100,
        exchangeRate: 1.3,
        toAmount: 130,
    },
]

describe("<TradeHistory />", () => {
    const mockReplace = jest.fn();
    const fakeSearchParams = new URLSearchParams({
        page: "2",
        limit: "5",
        sortBy: "date",
        sortOrder: "asc",
    });

    beforeEach(() => {
        (useT as jest.Mock).mockReturnValue({
        t: (key: string) => {
            const map: Record<string, string> = {
                "columns.date": "Date",
                "columns.from": "From",
                "columns.to": "To",
                "columns.amount": "Amount",
                "columns.rate": "Rate",
                "columns.output": "Output",
                "title": "My History",
            };
            return map[key] ?? key;
        },
        });

        // mock router + params
        (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
        (useSearchParams as jest.Mock).mockReturnValue(fakeSearchParams);
        (usePathname as jest.Mock).mockReturnValue("/history");
    });

    it("fetches + displays rows", async () => {
        (getExchangeHistory as jest.Mock).mockResolvedValue({
            totalPages: 3,
            history: mockHistory,
        });

        render(<TradeHistory />);

        const rowItems = await screen.findAllByText(/USD/);
        expect(rowItems).toHaveLength(2);
    });

    it("toggles filter panel", async () => {
        (getExchangeHistory as jest.Mock).mockResolvedValue({ totalPages: 0, history: [] });

        render(<TradeHistory />);

        const btn = await screen.findByRole("button", { name: /Filter/i });
        expect(screen.getByTestId("filters")).toHaveTextContent("closed");

        fireEvent.click(btn);
        expect(screen.getByTestId("filters")).toHaveTextContent("open");

        fireEvent.click(btn);
        expect(screen.getByTestId("filters")).toHaveTextContent("closed");
    });

    it("handles API 400 error by showing no rows", async () => {
        const err: any = new Error("Bad Request");
        err.response = { status: 400 };
        (getExchangeHistory as jest.Mock).mockRejectedValue(err);

        render(<TradeHistory />);

        await waitFor(() => {
            const rowsContainer = screen.getByTestId("rows");
            expect(rowsContainer.children).toHaveLength(0);
        });
    });

    it("changes sort order when clicking the same column", async () => {
        (getExchangeHistory as jest.Mock).mockResolvedValue({ totalPages: 1, history: [] });
        render(<TradeHistory />);

        const dateHeader = await screen.findByText("Date");
        fireEvent.click(dateHeader);

        expect(mockReplace).toHaveBeenCalledWith(
            expect.stringContaining("sortOrder=desc")
        );
    });

    it("changes sort-by when clicking a different column", async () => {
        (getExchangeHistory as jest.Mock).mockResolvedValue({ totalPages: 1, history: [] });
        render(<TradeHistory />);

        const fromHeader = await screen.findByText("From");
        fireEvent.click(fromHeader);
        expect(mockReplace).toHaveBeenCalledWith(
            expect.stringContaining("sortBy=from")
        );
    });
});
