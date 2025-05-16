import Image, { StaticImageData } from "next/image";

import { Currency, currencyToSignMap, getAllCurrencies } from "@/utils/currency"
import { useAuth } from "@/contexts/Auth"
import { useState } from "react";
import { useT } from "@/i18n/client";
import { AddFundsForm } from "../AddFundsForm";
import { brazilFlag, usaFlag, japanFlag, europeFlag, unitedKingdomFlag } from "@/assets";

import styles from "./styles.module.scss"

const currencyToImage: Record<Currency, StaticImageData> = {
    BRL: brazilFlag,
    EUR: europeFlag,
    GBP: unitedKingdomFlag,
    JPY: japanFlag,
    USD: usaFlag
}

export const Wallets = () => {
    const { t } = useT("dashboard");
    const { user } = useAuth();
    const [showAddFundsForm, setShowAddForms] = useState(false);
    const [addFundsTo, setAddFundsTo] = useState<Currency>(Currency.USD);
    
    const handleAddFundsButtonClick = (currency: Currency) => {
        setShowAddForms(true);
        setAddFundsTo(currency);
    };

    return (
        <div className={styles.wallets}>
            <h3 className={styles.title}>{t("wallets")}</h3>
            <div className={styles.content}>
                {getAllCurrencies().map(c => (
                    <div className={styles.wallet} key={c}>
                        <div className={styles.flagBox}>
                            <Image src={currencyToImage[c]} width={42} height={42} alt={c} />
                            <div className={styles.currencyNameBox}>
                                <span className={styles.name}>{c}</span>
                                <span className={styles.balance}>{t("balance")}</span>
                            </div>
                        </div>

                        <div className={styles.amount}>
                            {`${currencyToSignMap[c]} ${user ? user.wallet[c].toFixed(2) : 0}`}
                        </div>
                    </div>
                ))}
            </div>
            <button
                className={styles.addFundsBtn}
                onClick={() => handleAddFundsButtonClick(Currency.GBP)}
            >
                {t("button.add-funds")}
            </button>
            {showAddFundsForm && (
                <AddFundsForm
                    close={() => setShowAddForms(false)}
                    defaultValue={addFundsTo}
                />
            )}
        </div>
    )
}