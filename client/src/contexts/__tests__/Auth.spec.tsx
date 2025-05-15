import { act, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../Auth";
import * as api from "@/utils/api";
import { http } from "@/lib/api";
import { useRouter } from "next/navigation";

jest.mock("@/utils/api");
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn().mockReturnValue("/")
}));

const TestComponent = () => {
    const { user, login, logout, signup, updateUser } = useAuth();
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
            <button onClick={() => logout()}>Logout</button>
            <button onClick={updateUser}>Update</button>
        </div>
    );
};

describe("AuthContext", () => {
    const mockUser = { id: 1, email: "user@example.com" };
    const renderWithProvider = () =>
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

    it("calls getUser on mount and sets user", async () => {
        (api.getUser as jest.Mock).mockResolvedValueOnce(mockUser);

        renderWithProvider();

        expect(
            await screen.findByText(`user: ${mockUser.email}`)
        ).toBeInTheDocument();

    });
    
    it("login updates the user state", async () => {
        (api.getUser as jest.Mock).mockRejectedValue({});
        (api.login as jest.Mock).mockReturnValueOnce(mockUser);

        renderWithProvider();

        await screen.findByText("user: none")

        screen.getByText(/login/i).click();
        await screen.findByText(`user: ${mockUser.email}`);
        
        expect(await screen.findByText(`user: none`)).toBeInTheDocument();
    });

    it("logout updates the user state", async () => {
        const router = { push: jest.fn() };
        (api.getUser as jest.Mock).mockReturnValueOnce(mockUser);
        (useRouter as jest.Mock).mockReturnValue(router);

        renderWithProvider();

        await screen.findByText(`user: ${mockUser.email}`);
        act(() => screen.getByText(/Logout/i).click());
        
        expect(await screen.findByText(`user: none`)).toBeInTheDocument();
    });

    it("signup updates the user state", async () => {
        (api.signup as jest.Mock).mockReturnValueOnce(mockUser);

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

        (api.getUser as jest.Mock).mockReturnValueOnce(mockUser);
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
