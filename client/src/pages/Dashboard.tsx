import { useState } from "react";
import { rightArrow } from "../assets";
import { Header } from "../components/Header";
import { Modal } from "../components/Modal";

import styles from "../styles/Dashboard.module.scss";
import { CurrencyDropdown } from "../components/CurrencyDropdown";
import { addToWallet, exchangeCurrencies } from "../utils/api";
import { Currency, isCurrency } from "../utils/currency";
import { useAuth } from "../contexts/Auth";
import { InputField } from "../components/InputField";
import { useToast } from "../contexts/Toast";

export default function Dashboard() {
    const toast = useToast();
    const { user, updateUser } = useAuth();
    const [showAddFundsForm, setShowAddForms] = useState(false);
    const [exchangeFrom, setExchangeFrom] = useState<Currency>(Currency.USD);
    const [addFundsTo, setAddFundsTo] = useState<Currency>(Currency.USD);
    const toCurrency =
        exchangeFrom === Currency.USD ? Currency.GBP : Currency.USD;

    const handleAddFundsForm = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const amount = formData.get("amount") as string;
        const currency = formData.get("currency") as string;

        if (!isCurrency(currency)) return;

        try {
            await addToWallet(parseInt(amount), currency);
            updateUser();
            setShowAddForms(false);
            toast({ message: "Funds added successfully", status: "success" });
        } catch (error: any) {
            toast({ message: "Something went wrong", status: "error" });
        }
    };

    const handleExchangeForm = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const amount = formData.get("amount") as string;

        try {
            await exchangeCurrencies(
                exchangeFrom,
                toCurrency,
                parseInt(amount)
            );
            updateUser();
            toast({ message: "Exchange made successfully", status: "success" });
        } catch (error: any) {
            if (error?.response?.data?.message?.includes("Insufficient amount")) {
                toast({ message: "Insufficient amount for exchange", status: "error" });
                return
            }
            toast({ message: "Something went wrong", status: "error" });
        }
    };

    const handleAddFundsButtonClick = (currency: Currency) => {
        setShowAddForms(true);
        setAddFundsTo(currency);
    };

    return (
        <div className={styles.dashboardPage}>
            <Header />
            <div className={styles.content}>
                <section className={styles.walletContainer}>
                    <div className={styles.wallet}>
                        <h2 className={styles.amount}>
                            ${user?.wallet.USD.toFixed(2)}
                        </h2>
                        <span className={styles.type}>USD wallet</span>
                        <button
                            className={styles.addFundsBtn}
                            onClick={() =>
                                handleAddFundsButtonClick(Currency.USD)
                            }
                        >
                            Add Funds
                        </button>
                    </div>
                    <div className={styles.wallet}>
                        <h2 className={styles.amount}>
                            £{user?.wallet.GBP.toFixed(2)}
                        </h2>
                        <span className={styles.type}>GBP wallet</span>
                        <button
                            className={styles.addFundsBtn}
                            onClick={() =>
                                handleAddFundsButtonClick(Currency.GBP)
                            }
                        >
                            Add Funds
                        </button>
                    </div>
                    {showAddFundsForm && (
                        <Modal close={() => setShowAddForms(false)}>
                            <form
                                className={styles.addFundsForm}
                                onSubmit={handleAddFundsForm}
                            >
                                <h3>Add funds</h3>
                                <CurrencyDropdown
                                    selectName="currency"
                                    inputName="amount"
                                    defaultValue={addFundsTo}
                                    prefix={
                                        addFundsTo === Currency.USD ? "$" : "£"
                                    }
                                    onChange={() => setAddFundsTo}
                                />
                                <button className={styles.submitBtn}>
                                    Add
                                </button>
                            </form>
                        </Modal>
                    )}
                </section>

                <section className={styles.liveExchangeRateBox}>
                    <h3>Live Exchange Rate</h3>
                    <span className={styles.rate}>1 USD = 0.80 GBP</span>
                </section>

                <section className={styles.exchangeCurrencyContainer}>
                    <h3>Exchange Currency</h3>

                    <form
                        id="myform"
                        className={styles.exchangeCurrencyForm}
                        onSubmit={handleExchangeForm}
                    >
                        <CurrencyDropdown
                            selectName="fromCurrency"
                            inputName="amount"
                            prefix={exchangeFrom === Currency.USD ? "$" : "£"}
                            onChange={(e) =>
                                setExchangeFrom(e.target.value as Currency)
                            }
                            defaultValue={exchangeFrom}
                        />
                        <img
                            src={rightArrow}
                            alt="arrow"
                            className={styles.arrowImg}
                        />
                        <div className={styles.referenceInputBox}>
                            <div className={styles.toCurrency}>
                                {toCurrency}
                            </div>
                            <InputField
                                className={styles.referenceInput}
                                type="number"
                                prefix={
                                    exchangeFrom === Currency.USD ? "£" : "$"
                                }
                                value={100}
                                readOnly
                            />
                        </div>
                    </form>

                    <button
                        form="myform"
                        type="submit"
                        className={styles.exchangeBtn}
                    >
                        Exchange
                    </button>
                    <a href="/trade-history">See history</a>
                </section>
            </div>
        </div>
    );
}
