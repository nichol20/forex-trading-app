import { useEffect, useState } from "react";

import { rightArrow } from "../assets";
import { Header } from "../components/Header";
import { CurrencyDropdown } from "../components/CurrencyDropdown";
import { exchangeCurrencies } from "../utils/api";
import { Currency } from "../utils/currency";
import { useAuth } from "../contexts/Auth";
import { InputField } from "../components/InputField";
import { useToast } from "../contexts/Toast";
import { Rates } from "../types/exchange";
import * as api from "../utils/api";
import styles from "../styles/Dashboard.module.scss";
import { socket } from "../socket";
import { AddFundsForm } from "../components/AddFundsForm";
import { getInvertedRate } from "../utils/exchange";

export default function Dashboard() {
    const toast = useToast();
    const { user, updateUser } = useAuth();
    const [showAddFundsForm, setShowAddForms] = useState(false);
    const [exchangeFrom, setExchangeFrom] = useState<Currency>(Currency.USD);
    const [addFundsTo, setAddFundsTo] = useState<Currency>(Currency.USD);
    const [USDBasedRates, setUSDBasedRates] = useState<Rates | null>();
    const [amountToExchange, setAmountToExchange] = useState<number>(0);
    const toCurrency = exchangeFrom === Currency.USD ? Currency.GBP : Currency.USD;

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
                parseFloat(amount)
            );
            updateUser();
            toast({ message: "Exchange made successfully", status: "success" });
        } catch (error: any) {
            if (
                error?.response?.data?.message?.includes("Insufficient amount")
            ) {
                toast({
                    message: "Insufficient amount for exchange",
                    status: "error",
                });
                return;
            }
            toast({ message: "Something went wrong", status: "error" });
        }
    };

    const handleAddFundsButtonClick = (currency: Currency) => {
        setShowAddForms(true);
        setAddFundsTo(currency);
    };

    const getReferenceValue = () => {
        if (!USDBasedRates) return 0

        if (exchangeFrom === Currency.USD) {
            return (amountToExchange * USDBasedRates.GBP).toFixed(6)
        }

        return (amountToExchange * getInvertedRate(USDBasedRates.GBP)).toFixed(6)
    }

    useEffect(() => {
        const fetchRates = async () => {
            const exchangeRates = await api.getExchangeRates(Currency.USD);
            setUSDBasedRates(exchangeRates);
        };

        fetchRates();

        socket.connect();
        socket.on("exchange-rates:USD", setUSDBasedRates);

        return () => {
            socket.off("exchange-rates:USD");
            socket.disconnect();
        };
    }, []);

    return (
        <div className={styles.dashboardPage}>
            <Header />
            <div className={styles.content}>
                <section className={styles.walletContainer}>
                    <div className={styles.wallet}>
                        <h2 className={styles.amount}>
                            ${user ? user.wallet.USD.toFixed(2) : "0.00"}
                        </h2>
                        <span className={styles.type}>USD wallet</span>
                        <button
                            className={styles.addFundsBtn}
                            onClick={() => handleAddFundsButtonClick(Currency.USD)}
                        >
                            Add Funds
                        </button>
                    </div>
                    <div className={styles.wallet}>
                        <h2 className={styles.amount}>
                            £{user ? user.wallet.GBP.toFixed(2) : "0.00"}
                        </h2>
                        <span className={styles.type}>GBP wallet</span>
                        <button
                            className={styles.addFundsBtn}
                            onClick={() => handleAddFundsButtonClick(Currency.GBP)}
                        >
                            Add Funds
                        </button>
                    </div>
                    {showAddFundsForm && (
                        <AddFundsForm
                            close={() => setShowAddForms(false)}
                            defaultValue={addFundsTo}
                        />
                    )}
                </section>

                <section className={styles.liveExchangeRateBox}>
                    <h3>Live Exchange Rate</h3>
                    <span className={styles.rate}>
                        {USDBasedRates
                            ? `${USDBasedRates.USD} USD = ${USDBasedRates.GBP} GBP`
                            : "..."}
                    </span>
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
                            onChange={setExchangeFrom}
                            defaultValue={exchangeFrom}
                            onInputChange={setAmountToExchange}
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
                                prefix={exchangeFrom === Currency.USD ? "£" : "$"}
                                value={getReferenceValue()}
                                readOnly
                            />
                        </div>
                    </form>

                    <button form="myform" type="submit" className={styles.exchangeBtn}>
                        Exchange
                    </button>
                    <a href="/trade-history">See history</a>
                </section>
            </div>
        </div>
    );
}
