import { render, screen, fireEvent } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import { Filters } from ".";
import { Currency } from "@/utils/currency";

jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
    useRouter: jest.fn(),
    useSearchParams: () => ({
        toString: () => ""
    }),
}))

jest.mock('@/i18n/client', () => ({
    useT: jest.fn(() => ({ t: (text: string) => text }))
}))

jest.mock("@/components/DoubleSlider", () => ({
    DoubleSlider: ({ onChange, value }: { onChange: (v: [number, number]) => void, value: [number, number] }) => {
        return (
            <>
                <input
                    min={0}
                    max={100}
                    defaultValue={0}
                    type="range" 
                    data-testid="range-input-left" 
                    onChange={e => onChange([parseInt(e.target.value), value[1]])} 
                />
                <input
                    min={0}
                    max={100}
                    defaultValue={0}
                    type="range" 
                    data-testid="range-input-right" 
                    onChange={e => onChange([value[0], parseInt(e.target.value)])} 
                />
            </>
        )
    }
}))

jest.mock("@/components/CurrencyDropdown", () => ({
    CurrencyDropdown: ({ onSelectChange }: { onSelectChange: (c: Currency) => void }) => {
        return (
            <select
                onChange={e => onSelectChange(e.target.value as Currency)} 
                data-testid="currency-select"
            >
                <option value={Currency.GBP}>GBP</option>
                <option value={Currency.USD}>USD</option>
            </select>
        )
    }
}))

const defaultProps = {
    isOpen: true,
    close: jest.fn(),
};

describe("Filters Component", () => {
    const mockRouter = {
        replace: jest.fn()
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (usePathname as jest.Mock).mockReturnValue("/test")
    });

    it("renders FiltersDesktop on wide screens", () => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 1024,
        });

        render(<Filters {...defaultProps} />);

        expect(screen.getByText("title.from")).toBeInTheDocument();
        expect(screen.getByText("title.to")).toBeInTheDocument();
        expect(screen.getByText("title.amount-output-rate")).toBeInTheDocument();
    });

    it("renders FiltersMobile on small screens", () => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 600,
        });

        render(<Filters {...defaultProps} />);
        expect(screen.getByText("title.modal")).toBeInTheDocument(); // Modal title
    });

    it("clears filters when 'Clear all' is clicked", () => {
        render(<Filters {...defaultProps} />);

        const clearButton = screen.getByText("clear-all-btn");
        fireEvent.click(clearButton);

        expect(mockRouter.replace).toHaveBeenCalledWith("/test?");
    });

    it("applies filters when 'Apply filters' is clicked", () => {
        render(<Filters {...defaultProps} />);

        const applyButton = screen.getByText("apply-filters-btn");
        fireEvent.click(applyButton);

        expect(mockRouter.replace).toHaveBeenCalledWith(expect.stringContaining("/test?"));
    });

    it("updates state when date input is changed", () => {
        render(<Filters {...defaultProps} />);

        const dateInputFrom = screen.getByTestId("date-input-from")
        const dateInputTo = screen.getByTestId("date-input-to")
        fireEvent.change(dateInputFrom, { target: { value: "2022-01-01" } });
        fireEvent.change(dateInputTo, { target: { value: "2022-12-31" } });

        expect(dateInputFrom).toHaveValue("2022-01-01");
        expect(dateInputTo).toHaveValue("2022-12-31");

        fireEvent.change(dateInputFrom, { target: { value: null } });
        expect(dateInputFrom).toHaveValue("");
    });

    it("should update with correct filters", () => {
        render(<Filters {...defaultProps} />);

        // amount, output and rate
        const leftRangeInputs = screen.getAllByTestId("range-input-left" );
        const rightRangeInputs = screen.getAllByTestId("range-input-right");
        fireEvent.change(rightRangeInputs[0], { target: { value: 50 } })

        expect(leftRangeInputs).toHaveLength(3);
        expect(rightRangeInputs).toHaveLength(3);

        for(let i = 0; i < 3; i++) {
            fireEvent.change(rightRangeInputs[i], { target: { value: 50 } })
            fireEvent.change(leftRangeInputs[i], { target: { value: 10 } })
        }

        // from and to
        const currencyDropdowns = screen.getAllByTestId("currency-select");
        expect(currencyDropdowns).toHaveLength(2);

        fireEvent.change(currencyDropdowns[0], { target: { value: Currency.GBP } })
        fireEvent.change(currencyDropdowns[1], { target: { value: Currency.USD } })
        
        //end and start
        const dateInputFrom = screen.getByTestId("date-input-from")
        const dateInputTo = screen.getByTestId("date-input-to")
        fireEvent.change(dateInputFrom, { target: { value: "2022-01-01" } });
        fireEvent.change(dateInputTo, { target: { value: "2022-12-31" } });

        const applyButton = screen.getByText("apply-filters-btn");
        fireEvent.click(applyButton);

        const urlArg = mockRouter.replace.mock.calls[0][0];
        [
            "/test?",
            "minAmount=10",
            "minOutput=10",
            "minRate=10",
            "maxAmount=50",
            "maxOutput=50",
            "maxRate=50",
            "from=GBP",
            "to=USD",
            "start=2022-01-01",
            "end=2022-12-31"
        ].forEach(substr => {
            expect(urlArg).toContain(substr);
        });
    })
});
