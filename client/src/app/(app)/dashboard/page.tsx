"use client"
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import * as api from "@/utils/api";
import { socket } from "@/socket";
import { rightArrow } from "@/assets";
import { Header } from "@/components/Header";
import { CurrencyDropdown } from "@/components/CurrencyDropdown";
import { exchangeCurrencies } from "@/utils/api";
import { Currency, getSign } from "@/utils/currency";
import { useAuth } from "@/contexts/Auth";
import { InputField } from "@/components/InputField";
import { useToast } from "@/contexts/Toast";
import { Rates } from "@/types/exchange";
import { AddFundsForm } from "@/components/AddFundsForm";
import { getInvertedRate } from "@/utils/exchange";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { toUtcDateString } from "@/utils/date";

import styles from "./styles.module.scss";

export default function Dashboard() {
    const toast = useToast();
    const { user, updateUser } = useAuth();
    const chartParentRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(0);
    const [chartHeight, setChartHeight] = useState(350)
    const [timeSeriesDates, setTimeSeriesDates] = useState<string[]>([])
    const [timeSeriesValues, setTimeSeriesValues] = useState<number[]>([])
    const [showAddFundsForm, setShowAddForms] = useState(false);
    const [exchangeFrom, setExchangeFrom] = useState<Currency>(Currency.USD);
    const [addFundsTo, setAddFundsTo] = useState<Currency>(Currency.USD);
    const [USDBasedRates, setUSDBasedRates] = useState<Rates>();
    const [amountToExchange, setAmountToExchange] = useState<number>(100);
    const toCurrency = exchangeFrom === Currency.USD ? Currency.GBP : Currency.USD;

    const handleExchangeForm = async (event: React.FormEvent<HTMLFormElement>) => {
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
        if (!USDBasedRates) return 0;

        if (exchangeFrom === Currency.USD) {
            return (amountToExchange * USDBasedRates.GBP).toFixed(6);
        };

        return (amountToExchange * getInvertedRate(USDBasedRates.GBP)).toFixed(6);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const exchangeRates = await api.getExchangeRates(Currency.USD);
                setUSDBasedRates(exchangeRates);

                const end = new Date()
                const start = new Date()
                start.setDate(end.getDate() - 12)
                const timeSeries = await api.getTimeSeries(
                    Currency.USD, 
                    Currency.GBP,
                    toUtcDateString(start),
                    toUtcDateString(end)
                )
                
                const usdToGbpTimeSeries = timeSeries[Currency.GBP]

                if(usdToGbpTimeSeries) {
                    setTimeSeriesDates(Object.keys(usdToGbpTimeSeries))
                    setTimeSeriesValues(Object.values(usdToGbpTimeSeries))
                }
            } catch (error: any) {
                console.log("erro fetching data: ", error.message)
            }
        };

        console.log("test")
        // fetchData();
    } ,[])

    useEffect(() => {
        socket.connect();
        socket.on("exchange-rates:USD", setUSDBasedRates);

        return () => {
            socket.off("exchange-rates:USD");
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const parent = chartParentRef.current;
        if (!parent) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const newWidth = entries[0].contentRect.width;

            if (newWidth <= 350) {
                setChartHeight(newWidth);
            }

            setChartWidth(newWidth);
        });

        resizeObserver.observe(parent);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className={styles.dashboardPage}>
            <Header />
            <div className={styles.content}>
                <section className={styles.walletContainer}>
                    <div className={styles.wallet}>
                        <h2 className={styles.amount}>
                            {getSign(Currency.USD)}{user ? user.wallet.USD.toFixed(2) : "0.00"}
                        </h2>
                        <span className={styles.type}>USD wallet</span>
                        <button
                            className={styles.addFundsBtn}
                            onClick={() => handleAddFundsButtonClick(Currency.USD)}
                            data-testid="add-funds-btn-usd"
                        >
                            Add Funds
                        </button>
                    </div>
                    <div className={styles.wallet}>
                        <h2 className={styles.amount}>
                            {getSign(Currency.GBP)}{user ? user.wallet.GBP.toFixed(2) : "0.00"}
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
                    <div className={styles.titleBox}>
                        <div className={styles.pingContainer}>
                            <div className={styles.ping}>
                                <div></div>
                            </div>
                        </div>
                        <h3>Live Exchange Rate</h3>
                    </div>

                    <div className={styles.chartContainer} ref={chartParentRef}>
                        <TimeSeriesChart
                            data={timeSeriesValues} 
                            labels={timeSeriesDates} 
                            width={chartWidth} 
                            height={chartHeight} 
                        />
                    </div>

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
                            onSelectChange={setExchangeFrom}
                            defaultCurrencyValue={exchangeFrom}
                            defaultAmountValue={amountToExchange}
                            onInputChange={setAmountToExchange}
                            inputTestId="currency-dropdown-input"
                        />
                        <Image
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
                                prefix={getSign(toCurrency)}
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
