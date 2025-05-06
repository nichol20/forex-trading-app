import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '.'

describe('Modal', () => {
    it('renders the children content', () => {
        render(
            <Modal close={jest.fn()}>
                <div>Modal Content</div>
            </Modal>
        )

        expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('calls close when the close button is clicked', () => {
        const closeMock = jest.fn()

        render(
            <Modal close={closeMock}>
                <div>Content</div>
            </Modal>
        )

        const closeBtn = screen.getByRole('button', { name: /x/i })
        fireEvent.click(closeBtn)
        expect(closeMock).toHaveBeenCalled()
    })
})
