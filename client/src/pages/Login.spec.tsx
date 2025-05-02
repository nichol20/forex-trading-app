import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../pages/Login'
import { useAuth } from '../contexts/Auth'
import { MemoryRouter } from 'react-router'

// Mock useAuth
jest.mock('../contexts/Auth', () => ({
    useAuth: jest.fn()
}))

jest.mock("../contexts/Toast", () => ({
    useToast: () => jest.fn()
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate
}))

describe('LoginPage', () => {
    const loginMock = jest.fn()
    const setup = (authOverrides = {}) => {
        (useAuth as jest.Mock).mockReturnValue({
            login: loginMock,
            user: null,
            ...authOverrides
        })

        return render(<LoginPage />, { wrapper: MemoryRouter })
    }

    it('renders email and password input fields and a login button', () => {
        setup()

        expect(screen.getByTestId('email')).toBeInTheDocument()
        expect(screen.getByTestId('password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('calls login with correct credentials on submit', async () => {
        setup()

        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } })

        fireEvent.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123')
        })
    })

    it('shows error message when login throws 401/404 error', async () => {
        loginMock.mockRejectedValue({ response: { status: 401 } })
        setup()

        fireEvent.change(screen.getByTestId('email'), { target: { value: 'fail@example.com' } })
        fireEvent.change(screen.getByTestId('password'), { target: { value: 'wrongpass' } })

        fireEvent.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
        })
    })

    it('redirects to home if user is already logged in', () => {
        setup({ user: { id: 1, name: 'Alice' } })
        expect(mockNavigate).toHaveBeenCalledWith('/')
    })
})
