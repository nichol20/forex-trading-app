import { render, screen, fireEvent } from "@testing-library/react";
import { Filters } from "./";
import { MemoryRouter, useNavigate } from "react-router";
import { useLocation } from "react-router";

jest.mock("react-router", () => ({
    ...jest.requireActual("react-router"),
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
}))

const defaultProps = {
    isOpen: true,
    close: jest.fn(),
  };

describe("Filters Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useLocation as jest.Mock).mockReturnValue({
            pathname: "/test",
            search: "",
        })
        jest.clearAllMocks();
    });

    it("renders FiltersDesktop on wide screens", () => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 1024,
        });

        render(<Filters {...defaultProps} />, { wrapper: MemoryRouter });

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

        render(<Filters {...defaultProps} />, { wrapper: MemoryRouter });
        expect(screen.getByText("Filters")).toBeInTheDocument(); // Modal title
    });

    it("clears filters when 'Clear all' is clicked", () => {
        render(<Filters {...defaultProps} />, { wrapper: MemoryRouter });

        const clearButton = screen.getByText("Clear all");
        fireEvent.click(clearButton);

        expect(mockNavigate).toHaveBeenCalledWith("/test?", { replace: false });
    });

    it("applies filters when 'Apply filters' is clicked", () => {
        render(<Filters {...defaultProps} />, { wrapper: MemoryRouter });

        const applyButton = screen.getByText("Apply filters");
        fireEvent.click(applyButton);

        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("/test?"), {
            replace: false,
        });
    });

    it("updates state when date input is changed", () => {
        render(<Filters {...defaultProps} />, { wrapper: MemoryRouter });

        const dateInputFrom = screen.getByTestId("date-input-from")
        const dateInputTo = screen.getByTestId("date-input-to")
        fireEvent.change(dateInputFrom, { target: { value: "2022-01-01" } });
        fireEvent.change(dateInputTo, { target: { value: "2022-12-31" } });

        expect(dateInputFrom).toHaveValue("2022-01-01");
        expect(dateInputTo).toHaveValue("2022-12-31");
    });
});
