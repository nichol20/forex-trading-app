import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddFundsForm } from ".";
import { Currency, isCurrency } from "@/utils/currency";
import * as api from "@/utils/api";
import { useAuth } from "@/contexts/Auth";
import { useToast } from "@/contexts/Toast";

jest.mock("@/utils/api");
jest.mock("@/contexts/Auth");
jest.mock("@/contexts/Toast");


describe("AddFundsForm", () => {
    let mockClose: jest.Mock;
    let mockUpdateUser: jest.Mock;
    let mockToast: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockClose = jest.fn();
        mockUpdateUser = jest.fn();
        mockToast = jest.fn();

        (useAuth as jest.Mock).mockReturnValue({ updateUser: mockUpdateUser });
        (useToast as jest.Mock).mockReturnValue(mockToast);
    });

    it("renders with default USD selected", () => {
        render(<AddFundsForm close={mockClose} />);

        expect(screen.getByText(Currency.USD)).toBeInTheDocument();
    });

    it("renders with a custom default currency", () => {
        render(<AddFundsForm close={mockClose} defaultValue={Currency.GBP} />);
        const select = screen.getByTestId("currency-select") as HTMLSelectElement;
        expect(select.value).toBe(Currency.GBP);
    });

    it("submits successfully: calls API, updateUser, shows success toast, and closes modal", async () => {
        (api.addToWallet as jest.Mock).mockResolvedValueOnce(undefined);

        render(<AddFundsForm close={mockClose} />);
        const select = screen.getByTestId("currency-select");
        const input = screen.getByTestId("amount-input");
        const button = screen.getByRole("button", { name: /add/i });

        fireEvent.change(select, { target: { value: Currency.GBP } });
        fireEvent.change(input, { target: { value: "123.45" } });

        fireEvent.click(button);

        await waitFor(() => {
            expect(api.addToWallet).toHaveBeenCalledWith(123.45, Currency.GBP);
        });
        expect(mockUpdateUser).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
            message: "Funds added successfully",
            status: "success",
        });
        expect(mockClose).toHaveBeenCalled();
    });

    it("handles API failure: shows error toast and does not close", async () => {
        (api.addToWallet as jest.Mock).mockRejectedValueOnce(new Error("fail"));

        render(<AddFundsForm close={mockClose} />);
        const select = screen.getByTestId("currency-select");
        const input = screen.getByTestId("amount-input");
        const button = screen.getByRole("button", { name: /add/i });

        fireEvent.change(select, { target: { value: Currency.USD } });
        fireEvent.change(input, { target: { value: "50" } });

        fireEvent.click(button);

        await waitFor(() => {
            expect(api.addToWallet).toHaveBeenCalledWith(50, Currency.USD);
        });
        expect(mockToast).toHaveBeenCalledWith({
            message: "Something went wrong",
            status: "error",
        });
    });

    it("does not submit if currency is invalid", async () => {
        render(<AddFundsForm close={mockClose} />);
        const select = screen.getByTestId("currency-select");
        const input = screen.getByTestId("amount-input");
        const button = screen.getByRole("button", { name: /add/i });

        fireEvent.change(select, { target: { value: "NOT_A_CURRENCY" } });
        fireEvent.change(input, { target: { value: "1000" } });

        fireEvent.click(button);

        await waitFor(() => {
            expect(api.addToWallet).not.toHaveBeenCalled();
        });
        expect(mockToast).not.toHaveBeenCalled();
        expect(mockUpdateUser).not.toHaveBeenCalled();
        expect(mockClose).not.toHaveBeenCalled();
    });
});
