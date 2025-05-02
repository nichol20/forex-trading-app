import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "../pages/Signup";
import { useAuth } from "../contexts/Auth";
import { MemoryRouter } from "react-router";
// Mock Auth context
jest.mock("../contexts/Auth", () => ({
    useAuth: jest.fn(),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
    ...jest.requireActual("react-router"),
    useNavigate: () => mockNavigate,
}));

describe("SignupPage", () => {
    const user = {
        name: "User",
        email: "user@example.com",
        password: "password123",
        differentPassword: "different"
    }
    const signupMock = jest.fn();

    const setup = (authOverrides = {}) => {
        (useAuth as jest.Mock).mockReturnValue({
            signup: signupMock,
            user: null,
            ...authOverrides,
        });

        return render(<SignupPage />, { wrapper: MemoryRouter });
    };

    const signUpUser = (withDifferentPassword: boolean = false) => {
        fireEvent.change(screen.getByTestId("name"), { target: { value: user.name }, });
        fireEvent.change(screen.getByTestId("email"), { target: { value: user.email }, });
        fireEvent.change(screen.getByTestId("password"), { target: { value: user.password }, });
        fireEvent.change(screen.getByTestId("confirmationPassword"), {
            target: {
                value: withDifferentPassword ? user.differentPassword : user.password
            },
        });

        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    }

    it("renders input fields and submit button", () => {
        setup();

        expect(screen.getByTestId("name")).toBeInTheDocument();
        expect(screen.getByTestId("email")).toBeInTheDocument();
        expect(screen.getByTestId("password")).toBeInTheDocument();
        expect(screen.getByTestId("confirmationPassword")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /sign up/i })
        ).toBeInTheDocument();
    });

    it("shows error if passwords do not match", async () => {
        setup();

        signUpUser(true)

        await waitFor(() => {
            expect(screen.getByText(/passwords must be the same/i)).toBeInTheDocument();
        });
    });

    it("calls signup when form is valid", async () => {
        setup();

        signUpUser()

        await waitFor(() => {
            expect(signupMock).toHaveBeenCalledWith(
                user.name,
                user.email,
                user.password
            );
        });
    });

    it("displays error if email already exists", async () => {
        signupMock.mockRejectedValue({
            response: {
                status: 409,
                data: { message: "email already exists" },
            },
        });

        setup();

        signUpUser();

        await waitFor(() => {
            expect(screen.getByText(/this email already exists!/i)).toBeInTheDocument();
        });
    });

    it("displays error if password is weak", async () => {
        signupMock.mockRejectedValue({
            response: {
                status: 400,
                data: { message: "password must be at least 6 characters" },
            },
        });

        setup();

        signUpUser();

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
        });
    });

    it("redirects to home if user is already logged in", () => {
        setup({ user: { name: "Alice" } });

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });
});
