import styles from "./style.module.scss";
import { InputField } from "../InputField";
import { Currency, getAllCurrencies, getSign } from "../../utils/currency";
import { useState } from "react";

interface CurrencyDropdownProps {
    selectName?: string;
    inputName?: string;
    onSelectChange?: (currency: Currency) => void;
    defaultCurrencyValue?: Currency | null;
    defaultAmountValue?: number;
    selectId?: string;
    selectTestId?: string;
    inputId?: string;
    inputTestId?: string;
    value?: string | number | readonly string[] | null;
    onInputChange?: (amount: number) => void
    showInput?: boolean
}

export const CurrencyDropdown = ({
    selectName,
    selectId,
    selectTestId,
    inputId,
    inputTestId,
    value,
    inputName,
    defaultCurrencyValue,
    defaultAmountValue,
    onSelectChange,
    onInputChange,
    showInput = true
}: CurrencyDropdownProps) => {
    const [currentCurrency, setCurrency] = useState<Currency>(defaultCurrencyValue ?? Currency.USD)

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const currency = event.target.value as Currency
        setCurrency(currency)
        if (onSelectChange) onSelectChange(currency)
    }

    const handleMoneyInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const currentValue = event.currentTarget.value;
        if (currentValue.split(".")[1]?.length > 2) {
            event.currentTarget.value = parseFloat(currentValue).toFixed(2);
        }
        onInputChange && onInputChange(parseFloat(event.currentTarget.value))
    }

    return (
        <div className={styles.dropdown}>
            <select
                name={selectName}
                id={selectId}
                value={value ?? undefined}
                className={`${styles.select} ${showInput ? "" : styles.onlySelect}`}
                defaultValue={defaultCurrencyValue ?? undefined}
                onChange={handleSelectChange}
                data-testid={selectTestId}
            >
                {getAllCurrencies().map((c) => (
                    <option key={c} value={c}>
                        {c}
                    </option>
                ))}
            </select>
            {showInput && <InputField
                className={styles.currencyInput}
                type="number"
                name={inputName}
                prefix={getSign(currentCurrency)}
                defaultValue={defaultAmountValue}
                min="0.01"
                step="0.01"
                onChange={handleMoneyInputChange}
                inputId={inputId}
                testId={inputTestId}
            />}
        </div>
    );
};
