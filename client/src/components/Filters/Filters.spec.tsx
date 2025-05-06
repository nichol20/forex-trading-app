import { render, screen, fireEvent } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filters } from ".";

jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
    useRouter: jest.fn(),
    useSearchParams: () => ({
        toString: () => ""
    }),
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
        jest.clearAllMocks();
    });

    it("renders FiltersDesktop on wide screens", () => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 1024,
        });

        render(<Filters {...defaultProps} />);

        expect(screen.getByText("From")).toBeInTheDocument();
        expect(screen.getByText("To")).toBeInTheDocument();
        expect(screen.getByText("Amount / Output / Rate")).toBeInTheDocument();
    });

    it("renders FiltersMobile on small screens", () => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 600,
        });

        render(<Filters {...defaultProps} />);
        expect(screen.getByText("Filters")).toBeInTheDocument(); // Modal title
    });

    it("clears filters when 'Clear all' is clicked", () => {
        render(<Filters {...defaultProps} />);

        const clearButton = screen.getByText("Clear all");
        fireEvent.click(clearButton);

        expect(mockRouter.replace).toHaveBeenCalledWith("/test?");
    });

    it("applies filters when 'Apply filters' is clicked", () => {
        render(<Filters {...defaultProps} />);

        const applyButton = screen.getByText("Apply filters");
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
    });
});
