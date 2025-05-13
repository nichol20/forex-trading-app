import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "./page";
import { useAuth } from "@/contexts/Auth";
import { useToast } from "@/contexts/Toast";
import * as api from "@/utils/api";
import { Currency } from "@/utils/currency";

// Mock modules
jest.mock("@/contexts/Auth");
jest.mock("@/contexts/Toast");
jest.mock("@/utils/api");
jest.mock("@/components/TimeSeriesChart", () => ({
    TimeSeriesChart: () => <div data-testid="chart" />,
}));
jest.mock("@/components/AddFundsForm", () => ({
    AddFundsForm: () => <div data-testid="add-funds-form" />,
}));
  
jest.mock("@/socket", () => ({
    socket: {
        connect: jest.fn(),
        disconnect: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
    }
}));

jest.mock('@/i18n/client', () => ({
    useT: jest.fn(() => ({ t: (text: string) => text }))
}))


describe("Dashboard", () => {
    const mockUpdateUser = jest.fn();
    const mockToast = jest.fn();

    beforeAll(() => {
        global.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    })

    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            user: {
                wallet: { USD: 1500, GBP: 1000 }
            },
            updateUser: mockUpdateUser,
        });

        (useToast as jest.Mock).mockReturnValue(mockToast);

        (api.getExchangeRates as jest.Mock).mockResolvedValue({
            USD: 1,
            GBP: 0.8,
        });

        (api.getTimeSeries as jest.Mock).mockResolvedValue({
            [Currency.GBP]: {
                "2023-01-01": 0.8,
                "2023-01-02": 0.82,
            }
        });

        (api.exchangeCurrencies as jest.Mock).mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders wallet balances", async () => {
        render(<Dashboard />);

        expect(await screen.findByText("usd-wallet-title")).toBeInTheDocument();
        expect(screen.getByText("$1500.00")).toBeInTheDocument();
        expect(screen.getByText("£1000.00")).toBeInTheDocument();
    });

    it("renders chart and exchange rate", async () => {
        render(<Dashboard />);
        expect(await screen.findByTestId("chart")).toBeInTheDocument();
        expect(await screen.findByText(/1 USD = 0.8 GBP/)).toBeInTheDocument();
    });

    it("handles successful currency exchange", async () => {
        render(<Dashboard />);
        const input = await screen.findByTestId("currency-dropdown-input");
        const referenceInput = screen.getByTestId("reference-input");

        fireEvent.change(input, { target: { value: "100" } });
        await waitFor(() => {
            expect(referenceInput).toHaveValue(100 * 0.8)
        })

        const button = screen.getByText("exchange-btn");
        fireEvent.click(button);

        await waitFor(() => {
            expect(api.exchangeCurrencies).toHaveBeenCalledWith(Currency.USD, Currency.GBP, 100);
        });
        expect(mockUpdateUser).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
            message: "exchange-made-message",
            status: "success"
        });
    });

    it("shows error toast on exchange failure", async () => {
        (api.exchangeCurrencies as jest.Mock).mockRejectedValue({
            response: { data: { message: "Insufficient amount" } }
        });

        render(<Dashboard />);
        const button = await screen.findByText("exchange-btn");
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                message: "insufficient-amount-error",
                status: "error",
            });
        });
    });

    it("should show add funds form", async () => {
        render(<Dashboard />);
        const button = await screen.findByTestId("add-funds-btn-usd");
        fireEvent.click(button);

        expect(screen.getByTestId("add-funds-form")).toBeInTheDocument();
    })
});
