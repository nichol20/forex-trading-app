import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "./page";
import { useAuth } from "@/contexts/Auth";
import { useToast } from "@/contexts/Toast";
import * as api from "@/utils/api";
import { Currency } from "@/utils/currency";

jest.mock("@/contexts/Auth");
jest.mock("@/contexts/Toast");
jest.mock("@/utils/api");
jest.mock("@/components/TimeSeriesChart", () => ({
    TimeSeriesChart: () => <div data-testid="chart" />,
}));
jest.mock("@/components/Wallets", () => ({
    Wallets: () => <div data-testid="wallets" />,
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
        (useAuth as jest.Mock).mockReturnValue({ updateUser: mockUpdateUser });

        (useToast as jest.Mock).mockReturnValue(mockToast);

        (api.getExchangeRates as jest.Mock).mockResolvedValue({
            USD: 1,
            EUR: 0.8,
            GBP: 0.7,
            JPY: 145.7,
            BRL: 5.6
        });
        (api.getLatestRates as jest.Mock).mockResolvedValue([]);

        (api.exchangeCurrencies as jest.Mock).mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it("renders chart and exchange rate", async () => {
        render(<Dashboard />);
        expect(await screen.findByTestId("chart")).toBeInTheDocument();
        expect(await screen.findByText(/1 USD = 0.7 GBP/)).toBeInTheDocument();
    });

    it("handles successful currency exchange", async () => {
        render(<Dashboard />);
        const input = await screen.findByTestId("currency-dropdown-input");
        const referenceInput = screen.getByTestId("reference-input");

        fireEvent.change(input, { target: { value: "100" } });
        await waitFor(() => {
            expect(referenceInput).toHaveValue(100 * 0.7)
        })

        const button = screen.getByText("exchange-btn");
        fireEvent.click(button);

        await waitFor(() => {
            expect(api.exchangeCurrencies).toHaveBeenCalledWith(Currency.USD, Currency.GBP, 100);
        });
        expect(mockToast).toHaveBeenCalledWith({
            message: "exchange-queued-message",
            status: "success"
        });
    });

    it("shows error toast on exchange failure", async () => {
        (api.exchangeCurrencies as jest.Mock).mockRejectedValueOnce({
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
});
