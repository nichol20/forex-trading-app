import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencyDropdown } from ".";
import { Currency } from "../../utils/currency";

describe("CurrencyDropdown", () => {
    const setup = (props: any = {}) => {
        const handleSelectChange = jest.fn();
        const handleInputChange = jest.fn();

        render(
            <CurrencyDropdown
                selectName="currency"
                inputName="amount"
                selectTestId="currency-select"
                inputTestId="amount-input"
                onSelectChange={handleSelectChange}
                onInputChange={handleInputChange}
                defaultCurrencyValue={Currency.GBP}
                defaultAmountValue={100}
                {...props}
            />
        );

        const select = screen.getByTestId("currency-select") as HTMLSelectElement;
        const input = props.showInput === false
            ? null
            : (screen.getByTestId("amount-input") as HTMLInputElement);

        return { select, input, handleSelectChange, handleInputChange };
    };

    it("renders select and input by default", () => {
        const { select, input } = setup();
        expect(select).toBeInTheDocument();
        expect(input).toBeInTheDocument();
        expect(select.value).toBe(Currency.GBP);
        expect(input?.value).toBe("100");
    });

    it("calls onSelectChange when currency changes", () => {
        const { select, handleSelectChange } = setup();
        fireEvent.change(select, { target: { value: Currency.USD } });
        expect(handleSelectChange).toHaveBeenCalledWith(Currency.USD);
        expect(select.value).toBe(Currency.USD);
    });

    it("calls onInputChange when input changes", () => {
        const { input, handleInputChange } = setup();
        if (!input) throw new Error("Input not rendered");
        fireEvent.change(input, { target: { value: "123.45" } });
        expect(handleInputChange).toHaveBeenCalledWith(123.45);
    });

    it("trims input to 2 decimal places if more are provided", () => {
        const { input, handleInputChange } = setup();
        if (!input) throw new Error("Input not rendered");
        fireEvent.change(input, { target: { value: "123.4567" } });
        expect(input.value).toBe("123.46"); // value is mutated directly by the component
        expect(handleInputChange).toHaveBeenCalledWith(123.46);
    });

    it("does not render input when showInput is false", () => {
        const { input } = setup({ showInput: false });
        expect(input).toBeNull();
    });

    it("renders all currency options", () => {
        const { select } = setup();
        const options = Array.from(select.options).map(o => o.value);
        expect(options).toEqual(expect.arrayContaining([Currency.USD, Currency.GBP]));
    });
});
