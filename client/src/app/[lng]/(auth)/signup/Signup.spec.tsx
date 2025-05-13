import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "./page";
import { useAuth } from "@/contexts/Auth";

jest.mock("@/contexts/Auth", () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/i18n/client', () => ({
    useT: jest.fn(() => ({ t: (text: string) => text }))
}))

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

        return render(<SignupPage />);
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

        fireEvent.click(screen.getByRole("button", { name: /signup-btn/i }));
    }

    it("renders input fields and submit button", () => {
        setup();

        expect(screen.getByTestId("name")).toBeInTheDocument();
        expect(screen.getByTestId("email")).toBeInTheDocument();
        expect(screen.getByTestId("password")).toBeInTheDocument();
        expect(screen.getByTestId("confirmationPassword")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /signup-btn/i })
        ).toBeInTheDocument();
    });

    it("shows error if passwords do not match", async () => {
        setup();

        signUpUser(true)

        await waitFor(() => {
            expect(screen.getByText(/field.password.password-mismatch-error/i)).toBeInTheDocument();
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
            expect(screen.getByText(/field.email.already-exists-error/i)).toBeInTheDocument();
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
            expect(screen.getByText(/field.password.weak-password-error/i)).toBeInTheDocument();
        });
    });
});
