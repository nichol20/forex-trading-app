import { render, screen, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from '../Toast'

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid'),
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

        expect(toastMessage).toBeInTheDocument()
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

        expect(toastMessage).toBeInTheDocument()
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