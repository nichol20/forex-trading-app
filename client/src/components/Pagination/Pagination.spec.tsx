import { render, screen, fireEvent } from "@testing-library/react"
import { Pagination } from "."
import { usePathname, useRouter, useSearchParams } from "next/navigation"

jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
    useRouter: jest.fn(),
    useSearchParams: () => ({
        toString: () => ""
    }),
}))

describe("Pagination", () => {
    const mockRouter = {
        replace: jest.fn()
    }

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter)
    })

    it("does not render if lastPage is 1", () => {
        render(<Pagination currentPage={1} lastPage={1} />)
        expect(screen.queryByRole("list")).not.toBeInTheDocument()
    })

    it("renders page items and navigates on click", () => {
        (usePathname as jest.Mock).mockReturnValue("/test")

        render(<Pagination currentPage={2} lastPage={6} />)
        expect(screen.getByText("...")).toBeInTheDocument()

        expect(screen.getByText("1")).toBeInTheDocument()
        expect(screen.getByText("2")).toBeInTheDocument()
        expect(screen.getByText("3")).toBeInTheDocument()
        expect(screen.getByText("6")).toBeInTheDocument()

        fireEvent.click(screen.getByText("3"))
        expect(mockRouter.replace).toHaveBeenCalledWith("/test?page=3")
    })

    it("shows previous and next arrows and they work", () => {
        (usePathname as jest.Mock).mockReturnValue("/test")

        render(<Pagination currentPage={3} lastPage={5} />)

        const chevrons = screen.getAllByAltText("chevron")
        expect(chevrons).toHaveLength(2)

        // Previous
        fireEvent.click(chevrons[0])
        expect(mockRouter.replace).toHaveBeenCalledWith("/test?page=2")

        // Next
        fireEvent.click(chevrons[1])
        expect(mockRouter.replace).toHaveBeenCalledWith("/test?page=4")
    })
})
