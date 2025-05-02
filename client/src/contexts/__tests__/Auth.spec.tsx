import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../Auth";
import * as api from "../../utils/api";
import { http } from "../../utils/http";
import { MemoryRouter } from "react-router";

jest.mock("../../utils/api");
jest.mock("react-router", () => ({
    ...jest.requireActual("react-router"),
    useNavigate: () => jest.fn(),
}));

const TestComponent = () => {
    const { user, login, signup, updateUser } = useAuth();
    return (
        <div>
            <div>user: {user?.email ?? "none"}</div>
            <button onClick={() => login("test@example.com", "password")}>
                Login
            </button>
            <button
                onClick={() => signup("John", "john@example.com", "password")}
            >
                Signup
            </button>
            <button onClick={updateUser}>Update</button>
        </div>
    );
};

const renderWithProvider = () =>
    render(
        <MemoryRouter>
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        </MemoryRouter>
    );

describe("AuthContext", () => {
    const mockUser = { id: 1, email: "user@example.com" };

    it("calls getUser on mount and sets user", async () => {
        (api.getUser as jest.Mock).mockResolvedValue(mockUser);

        renderWithProvider();

        expect(
            await screen.findByText(`user: ${mockUser.email}`)
        ).toBeInTheDocument();

    });

    it("login updates the user state", async () => {
        (api.login as jest.Mock).mockResolvedValue(mockUser);

        renderWithProvider();

        await screen.findByText("user: none");
        screen.getByText(/login/i).click();

        expect(
            await screen.findByText(`user: ${mockUser.email}`)
        ).toBeInTheDocument();

    });

    it("signup updates the user state", async () => {
        (api.signup as jest.Mock).mockResolvedValue(mockUser);

        renderWithProvider();

        await screen.findByText("user: none")
        screen.getByText(/signup/i).click();

        expect(
            await screen.findByText(`user: ${mockUser.email}`)
        ).toBeInTheDocument();
    })

    it("updateUser updates the user state", async () => {
        renderWithProvider();

        await screen.findByText("user: none");

        (api.getUser as jest.Mock).mockResolvedValue(mockUser);
        screen.getByText(/update/i).click();

        expect(
            await screen.findByText(`user: ${mockUser.email}`)
        ).toBeInTheDocument();
    })

    it("registers and removes interceptor on mount/unmount", () => {
        const ejectMock = jest.fn();
        http.interceptors.response.use = jest.fn(() => 123);
        http.interceptors.response.eject = ejectMock;

        const { unmount } = renderWithProvider();
        unmount();

        expect(ejectMock).toHaveBeenCalledWith(123);
    });
});
