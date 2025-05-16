import { useState } from "react";

import { InputField } from "../InputField";
import { Currency, currencyToSignMap, getAllCurrencies } from "../../utils/currency";
import styles from "./styles.module.scss";

interface BaseProps {
    selectName?: string;
    inputName?: string;
    onSelectChange?: (currency: Currency) => void;
    defaultCurrencyValue?: Currency | null;
    optionToNull?: boolean
    defaultAmountValue?: number;
    amountValue?: number | string;
    inputReadOnly?: boolean
    selectId?: string;
    selectTestId?: string;
    selectClassName?: string;
    inputId?: string;
    inputTestId?: string;
    value?: Currency | null
    onInputChange?: (amount: number) => void
    showInput?: boolean
}

interface CurrencyDropdownProps extends BaseProps {
    onSelectChange?: (currency: Currency) => void;
    optionToNull?: false
}

interface CurrencyDropdownPropsWithNullOption extends BaseProps{
    onSelectChange?: (currency: Currency | "") => void;
    optionToNull: true
}

type Props = CurrencyDropdownPropsWithNullOption | CurrencyDropdownProps

export const CurrencyDropdown = ({
    selectName,
    selectId,
    selectTestId,
    selectClassName,
    inputId,
    inputTestId,
    value,
    inputName,
    inputReadOnly,
    optionToNull,
    defaultCurrencyValue,
    defaultAmountValue,
    amountValue,
    onSelectChange,
    onInputChange,
    showInput = true
}: Props) => {
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const currency = event.target.value as Currency
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
                value={optionToNull 
                        ? value ?? "" 
                        : value ?? undefined}
                className={`${styles.select} ${showInput ? "" : styles.onlySelect} ${selectClassName}`}
                defaultValue={defaultCurrencyValue ?? undefined}
                onChange={handleSelectChange}
                data-testid={selectTestId}
            >
                {optionToNull && <option value="">-----</option>}
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
                prefix={value ? currencyToSignMap[value] : ""}
                value={amountValue}
                defaultValue={defaultAmountValue}
                min="0.01"
                step="0.01"
                onChange={handleMoneyInputChange}
                inputId={inputId}
                testId={inputTestId}
                readOnly={inputReadOnly}
            />}
        </div>
    );
};
