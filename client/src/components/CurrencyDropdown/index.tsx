import styles from "./style.module.scss";
import { InputField } from "../InputField";
import { Currency, getAllCurrencies } from "../../utils/currency";

interface CurrencyDropdownProps {
    selectName: string;
    inputName: string;
    prefix?: string;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
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
    prefix,
}: CurrencyDropdownProps) => {
    const handleMoneyInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
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
                onChange={onChange}
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
                prefix={prefix}
                defaultValue={100}
                min="0.01"
                step="0.01"
                onChange={handleMoneyInputChange}
            />
        </div>
    );
};
