import { render, screen, fireEvent } from "@testing-library/react"
import { Pagination } from "./"
import { useLocation, useNavigate } from "react-router"

jest.mock("react-router", () => ({
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
}))

describe("Pagination", () => {
    const mockNavigate = jest.fn()

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate)
        mockNavigate.mockClear();
    })

    it("does not render if lastPage is 1", () => {
        render(<Pagination currentPage={1} lastPage={1} />)
        expect(screen.queryByRole("list")).not.toBeInTheDocument()
    })

    it("renders page items and navigates on click", () => {
        (useLocation as jest.Mock).mockReturnValue({
            pathname: "/test",
            search: "",
        })

        render(<Pagination currentPage={2} lastPage={6} />)
        expect(screen.getByText("...")).toBeInTheDocument()

        expect(screen.getByText("1")).toBeInTheDocument()
        expect(screen.getByText("2")).toBeInTheDocument()
        expect(screen.getByText("3")).toBeInTheDocument()
        expect(screen.getByText("6")).toBeInTheDocument()

        fireEvent.click(screen.getByText("3"))
        expect(mockNavigate).toHaveBeenCalledWith("/test?page=3", { replace: false })
    })

    it("shows previous and next arrows and they work", () => {
        (useLocation as jest.Mock).mockReturnValue({
            pathname: "/test",
            search: "",
        })
        render(<Pagination currentPage={3} lastPage={5} />)

        const chevrons = screen.getAllByAltText("chevron")
        expect(chevrons).toHaveLength(2)

        // Previous
        fireEvent.click(chevrons[0])
        expect(mockNavigate).toHaveBeenCalledWith("/test?page=2", { replace: false })

        // Next
        fireEvent.click(chevrons[1])
        expect(mockNavigate).toHaveBeenCalledWith("/test?page=4", { replace: false })
    })
})
