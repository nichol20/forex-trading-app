import { act, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../Auth";
import * as api from "@/utils/api";
import { http } from "@/lib/api";
import { useRouter } from "next/navigation";

jest.mock("@/utils/api");
jest.mock("next/navigation", () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
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

const renderWithProvider = () =>
    render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
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

    it("redirects to /login on unauthorized getUser", async () => {
        const router = { push: jest.fn() };
        (api.getUser as jest.Mock).mockRejectedValue({
            response: { status: 401 },
        });

        (useRouter as jest.Mock).mockReturnValue(router);

        renderWithProvider();
        (await screen.findByText(/Login/i)).click();

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledWith("/login");
        });
    });
  
    it("logout updates the user state", async () => {
        (api.getUser as jest.Mock).mockResolvedValue(mockUser);

        renderWithProvider();

        await screen.findByText(`user: ${mockUser.email}`);
        act(() => screen.getByText(/Logout/i).click());
        
        expect(await screen.findByText(`user: none`)).toBeInTheDocument();
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
