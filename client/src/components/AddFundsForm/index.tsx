import { useState } from "react";
import { Currency, isCurrency } from "../../utils/currency";
import { CurrencyDropdown } from "../CurrencyDropdown"
import { Modal } from "../Modal"

import styles from "./style.module.scss"
import { addToWallet } from "../../utils/api";
import { useAuth } from "../../contexts/Auth";
import { useToast } from "../../contexts/Toast";

interface AddFundsFormProps {
    close: () => void
    defaultValue?: Currency
}

export const AddFundsForm = ({ close, defaultValue = Currency.USD }: AddFundsFormProps) => {
    const { updateUser } = useAuth()
    const toast = useToast()
    const [addFundsTo, setAddFundsTo] = useState<Currency>(defaultValue);

    const handleAddFundsForm = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const amount = formData.get("amount") as string;
        const currency = formData.get("currency") as string;

        if (!isCurrency(currency)) return;

        try {
            await addToWallet(parseFloat(amount), currency);
            updateUser();
            toast({ message: "Funds added successfully", status: "success" });
            close();
        } catch (error: any) {
            toast({ message: "Something went wrong", status: "error" });
        }
    };

    return (
        <Modal close={close}>
            <form
                className={styles.addFundsForm}
                onSubmit={handleAddFundsForm}
            >
                <h3>Add funds</h3>
                <CurrencyDropdown
                    selectName="currency"
                    selectId="currency-select"
                    selectTestId="currency-select"
                    inputName="amount"
                    inputTestId="amount-input"
                    defaultCurrencyValue={addFundsTo}
                    onSelectChange={() => setAddFundsTo}
                />
                <button className={styles.submitBtn}>
                    Add
                </button>
            </form>
        </Modal>
    )
} 