import { render, screen, fireEvent } from '@testing-library/react'
import { ClosableElement } from '.'

describe('ClosableElement', () => {
    it('does not render when isOpen is false', () => {
        render(
            <ClosableElement isOpen={false} close={jest.fn()}>
                <div>Inside content</div>
            </ClosableElement>
        )

        expect(screen.queryByText('Inside content')).not.toBeInTheDocument()
    })

    it('renders children when isOpen is true', () => {
        render(
            <ClosableElement isOpen={true} close={jest.fn()}>
                <div>Visible content</div>
            </ClosableElement>
        )

        expect(screen.getByText('Visible content')).toBeInTheDocument()
    })

    it('calls close when clicking outside', () => {
        const handleClose = jest.fn()

        render(
            <>
                <button data-testid="outside">Outside</button>
                <ClosableElement isOpen={true} close={handleClose}>
                    <div>Inside</div>
                </ClosableElement>
            </>
        )

        fireEvent.mouseDown(screen.getByTestId('outside'))
        expect(handleClose).toHaveBeenCalled()
    })

    it('does not call close when clicking inside', () => {
        const handleClose = jest.fn()

        render(
            <ClosableElement isOpen={true} close={handleClose}>
                <div>Click me</div>
            </ClosableElement>
        )

        fireEvent.mouseDown(screen.getByText('Click me'))
        expect(handleClose).not.toHaveBeenCalled()
    })
})
