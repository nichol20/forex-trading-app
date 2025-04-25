import styles from "./style.module.scss";
import { InputField } from "../InputField";
import { Currency, getAllCurrencies } from "../../utils/currency";
import { useState } from "react";

interface CurrencyDropdownProps {
    selectName: string;
    inputName: string;
    onChange?: (currency: Currency) => void;
    defaultValue?: Currency;
    selectId?: string;
    value?: string | number | readonly string[];
}

export const CurrencyDropdown = ({
    selectName,
    selectId,
    value,
    inputName,
    defaultValue,
    onChange,
}: CurrencyDropdownProps) => {
    const [currentCurrency, setCurrency] = useState<Currency>(defaultValue ?? Currency.USD)

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const currency = event.target.value as Currency
        setCurrency(currency)
        if (onChange) onChange(currency)
    }

    const handleMoneyInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const currentValue = event.target.value;
        if (currentValue.split(".")[1]?.length > 2) {
            event.target.value = parseFloat(currentValue).toFixed(2);
        }
    };

    return (
        <div className={styles.dropdown}>
            <select
                name={selectName}
                id={selectId}
                value={value}
                className={styles.select}
                defaultValue={defaultValue}
                onChange={handleSelectChange}
            >
                {getAllCurrencies().map((c) => (
                    <option key={c} value={c}>
                        {c}
                    </option>
                ))}
            </select>
            <InputField
                className={styles.currencyInput}
                type="number"
                name={inputName}
                prefix={currentCurrency === Currency.USD ? "$" : "£"}
                defaultValue={100}
                min="0.01"
                step="0.01"
                onChange={handleMoneyInputChange}
            />
        </div>
    );
};
