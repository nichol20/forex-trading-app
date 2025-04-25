import { render, screen } from '@testing-library/react'
import { ErrorMessage } from './index'

describe('ErrorMessage Component', () => {
    it('renders the error message passed as a prop', () => {
        const message = 'This is an error message'

        render(<ErrorMessage message={message} />)

        const errorMessageElement = screen.getByText(message)
        expect(errorMessageElement).toBeInTheDocument()

        expect(errorMessageElement).toHaveClass('errorMessage')
    })
})