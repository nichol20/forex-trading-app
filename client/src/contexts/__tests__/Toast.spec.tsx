import { render, screen, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from '../Toast'

// Mocking uuidv4 and image imports
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid'),
}))

jest.mock('../../assets', () => ({
    blueCheckMarkIcon: 'blueCheckMarkIcon.svg',
    redXIcon: 'redXIcon.svg',
}))


const TestComponent = () => {
    const toast = useToast()

    const handleSuccessToast = () => {
        toast({ message: 'Success!', status: 'success' })
    }

    const handleErrorToast = () => {
        toast({ message: 'Error!', status: 'error' })
    }

    return (
        <div>
            <button onClick={handleSuccessToast}>Show Success Toast</button>
            <button onClick={handleErrorToast}>Show Error Toast</button>
        </div>
    )
}

describe('ToastProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should show a success toast', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        )

        const button = screen.getByText('Show Success Toast')
        fireEvent.click(button)

        const toastMessage = screen.getByText('Success!')
        const toastIcon = screen.getByAltText('icon')

        expect(toastMessage).toBeInTheDocument()
        expect(toastIcon).toHaveAttribute('src', 'blueCheckMarkIcon.svg')
    })

    it('should show an error toast', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        )

        const button = screen.getByText('Show Error Toast')
        fireEvent.click(button)

        const toastMessage = screen.getByText('Error!')
        const toastIcon = screen.getByAltText('icon')

        expect(toastMessage).toBeInTheDocument()
        expect(toastIcon).toHaveAttribute('src', 'redXIcon.svg')
    })

    it('should remove a toast after timeout', () => {
        jest.useFakeTimers()
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        )

        const button = screen.getByText('Show Success Toast')
        fireEvent.click(button)

        const toastMessage = screen.getByText('Success!')
        expect(toastMessage).toBeInTheDocument()

        jest.advanceTimersByTime(4300)

        expect(toastMessage).not.toBeInTheDocument()
    })

    it('should remove a toast when clicked', () => {
        jest.useFakeTimers()
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        )

        const button = screen.getByText('Show Success Toast')
        fireEvent.click(button)

        const toastMessage = screen.getByText('Success!')
        expect(toastMessage).toBeInTheDocument()

        fireEvent.click(toastMessage)

        jest.advanceTimersByTime(300)

        expect(toastMessage).not.toBeInTheDocument()
    })
})