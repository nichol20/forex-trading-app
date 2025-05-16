import { render, screen, fireEvent } from "@testing-library/react";
import { Wallets } from "./index";
import { Currency, currencyToSignMap } from "@/utils/currency";

const mockUser = {
    wallet: {
        USD: 123.45,
        EUR: 67.89,
        GBP: 10.0,
        JPY: 1000,
        BRL: 5.5,
    },
};
jest.mock("@/contexts/Auth", () => ({
    useAuth: () => ({ user: mockUser }),
}));

jest.mock('@/i18n/client', () => ({
    useT: jest.fn(() => ({ t: (text: string) => text }))
}))

const mockDefaultValue = jest.fn();
jest.mock("../AddFundsForm", () => ({
    AddFundsForm: (props: any) => {
        mockDefaultValue.mockImplementation(() => props.defaultValue);
        return <>
            <div data-testid="add-funds-form">AddFundsForm: {props.defaultValue}</div>;
            <button onClick={props.close}>close</button>
        </>
    },
}));

describe("Wallets component", () => {
        it("renders one wallet box per currency with sign and formatted balance", () => {
        render(<Wallets />);

        Object.entries(mockUser.wallet).forEach(([cur, amount]) => {
            const sign = currencyToSignMap[cur as Currency];
            const formatted = `${sign} ${amount.toFixed(2)}`;
            expect(screen.getByText(formatted)).toBeInTheDocument();
        });

        expect(screen.getByText("wallets")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /button.add-funds/i })).toBeInTheDocument();
    });

    it("opens AddFundsForm with GBP when the add funds button is clicked", () => {
        render(<Wallets />);

        expect(screen.queryByTestId("add-funds-form")).not.toBeInTheDocument();

        const btn = screen.getByRole("button", { name: /button.add-funds/i });
        fireEvent.click(btn);

        const form = screen.getByTestId("add-funds-form");
        expect(form).toHaveTextContent("AddFundsForm: GBP");

        expect(mockDefaultValue()).toBe("GBP");

        const closeBtn = screen.getByRole("button", { name: /close/i });
        fireEvent.click(closeBtn);

        expect(screen.queryByTestId("add-funds-form")).not.toBeInTheDocument();
    });
});