import { useState } from "react";
import { Currency, currencyToSignMap, isCurrency } from "../../utils/currency";
import { CurrencyDropdown } from "../CurrencyDropdown"
import { Modal } from "../Modal"

import styles from "./styles.module.scss"
import { addToWallet } from "../../utils/api";
import { useAuth } from "../../contexts/Auth";
import { useToast } from "../../contexts/Toast";
import { useT } from "@/i18n/client";
import { InputField } from "../InputField";

interface AddFundsFormProps {
    close: () => void
    defaultValue?: Currency
}

export const AddFundsForm = ({ close, defaultValue = Currency.USD }: AddFundsFormProps) => {
    const { t } = useT("funds-form");
    const { updateUser, user } = useAuth();
    const toast = useToast();
    const [addFundsTo, setAddFundsTo] = useState<Currency>(defaultValue);
    const [isProcessing, setIsProcessing] = useState(false)

    const handleAddFundsForm = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        if(isProcessing) return

        setIsProcessing(true)
        const formData = new FormData(event.currentTarget);

        const amount = formData.get("amount") as string;
        const currency = formData.get("currency") as string;

        if (!isCurrency(currency)) return;

        try {
            await addToWallet(parseFloat(amount), currency);
            updateUser();
            toast({ message: t("funds-added-successfully"), status: "success" });
            close();
        } catch (error: any) {
            toast({ message: t("errors.unknown"), status: "error" });
        } finally {
            setIsProcessing(false)
        }
    };

    return (
        <Modal close={close}>
            <form
                className={styles.addFundsForm}
                onSubmit={handleAddFundsForm}
            >
                <h3>Add funds</h3>
                <InputField
                    type="number" 
                    prefix={currencyToSignMap[addFundsTo]}
                    title={t("balance-input-title")} 
                    value={user!.wallet[addFundsTo]} 
                    readOnly 
                />
                <CurrencyDropdown
                    selectName="currency"
                    selectId="currency-select"
                    selectTestId="currency-select"
                    inputName="amount"
                    inputTestId="amount-input"
                    value={addFundsTo}
                    onSelectChange={setAddFundsTo}
                />
                <button className={styles.submitBtn} disabled={isProcessing}>
                    {isProcessing ? t("processing") :  t("add-btn")}
                </button>
            </form>
        </Modal>
    )
} 