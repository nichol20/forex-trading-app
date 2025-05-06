import { render, screen, fireEvent } from '@testing-library/react'
import { InputField } from '.'

describe('InputField', () => {
    it('renders with a label and input', () => {
        render(<InputField title="Username" type="text" inputId="username" />)

        expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    it('renders a prefix if provided', () => {
        render(<InputField title="Price" type="number" prefix="$" inputId="price" />)

        expect(screen.getByText('$')).toBeInTheDocument()
    })

    it('displays error message if provided', () => {
        render(<InputField title="Email" type="email" inputId="email" errorMessage="Invalid email" />)

        expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })

    it('toggles password visibility', () => {
        render(<InputField title="Password" type="password" inputId="password" />)

        const input = screen.getByLabelText('Password') as HTMLInputElement
        const toggleButton = screen.getByRole('button')

        expect(input.type).toBe('password')

        fireEvent.click(toggleButton)
        expect(input.type).toBe('text')

        fireEvent.click(toggleButton)
        expect(input.type).toBe('password')
    })

    it('calls onChange when typing', () => {
        const handleChange = jest.fn()

        render(
            <InputField
                title="Name"
                type="text"
                inputId="name"
                onChange={handleChange}
            />
        )

        const input = screen.getByLabelText('Name')
        fireEvent.change(input, { target: { value: 'John' } })

        expect(handleChange).toHaveBeenCalled()
    })
})
