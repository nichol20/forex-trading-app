"use client"
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { useT } from "@/i18n/client";
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
import { Exchange, Rates } from "@/types/exchange";
import { AddFundsForm } from "@/components/AddFundsForm";
import { getInvertedRate } from "@/utils/exchange";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { toUtcDateString } from "@/utils/date";

import styles from "./styles.module.scss";
import { ExchangeRatesEventResponse } from "@/types/socket";

export default function Dashboard() {
    const { t } = useT("dashboard");
    const toast = useToast();
    const { user, updateUser } = useAuth();
    const chartParentRef = useRef<HTMLDivElement>(null);

    const [chartWidth, setChartWidth] = useState(0);
    const [chartHeight, setChartHeight] = useState(350)

    const [seconds, setSeconds] = useState(0); 

    const [latestRatesDates, setLatestRatesDates] = useState<string[]>([])
    const [latestRatesValues, setLatestRatesValues] = useState<number[]>([])

    const [showAddFundsForm, setShowAddForms] = useState(false);
    const [exchangeFrom, setExchangeFrom] = useState<Currency>(Currency.USD);
    const [addFundsTo, setAddFundsTo] = useState<Currency>(Currency.USD);
    const [liveExchangeRates, setLiveExchangeRates] = useState<Rates>();
    const [amountToExchange, setAmountToExchange] = useState<number>(100);
    const toCurrency = exchangeFrom === Currency.USD ? Currency.GBP : Currency.USD;
    const [isProcessing, setIsProcessing] = useState(false)

    const handleExchangeForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const amount = formData.get("amount") as string;

        if(isProcessing) return

        try {
            setIsProcessing(true)
            await exchangeCurrencies(
                exchangeFrom,
                toCurrency,
                parseFloat(amount)
            );
            toast({ message: "exchange queued", status: "success" });
        } catch (error: any) {
            if (
                error?.response?.data?.message?.includes("Insufficient amount")
            ) {
                toast({
                    message: t("insufficient-amount-error"),
                    status: "error",
                });
                return;
            }
            toast({ message: t("error.unknown"), status: "error" });
        }
    };

    const handleAddFundsButtonClick = (currency: Currency) => {
        setShowAddForms(true);
        setAddFundsTo(currency);
    };

    const getReferenceValue = () => {
        if (!liveExchangeRates) return 0;

        if (exchangeFrom === Currency.USD) {
            return (amountToExchange * liveExchangeRates.GBP).toFixed(6);
        };

        return (amountToExchange * liveExchangeRates.USD).toFixed(6);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const exchangeRates = await api.getExchangeRates(exchangeFrom);
                const latestRates = await api.getLatestRates(exchangeFrom)
                setLiveExchangeRates(exchangeRates);
                setLatestRatesValues(latestRates.map(r => exchangeFrom === Currency.USD ? r.rates.GBP : r.rates.USD));
                setLatestRatesDates(latestRates.map(r => new Date(r.time).toLocaleTimeString()));
            } catch (error: any) {
                console.log("erro fetching data: ", error.message)
            }
        };

        fetchData();
    } ,[exchangeFrom])

    useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect();
        }
    }, [])

    useEffect(() => {
        socket.on("exchange-rates:USD", (data: ExchangeRatesEventResponse) => {
            if(exchangeFrom !== Currency.USD) return 
            setLiveExchangeRates(data.rates);
            setLatestRatesValues(data.latestRates.map(r => r.rates.GBP))
            setLatestRatesDates(data.latestRates.map(r => new Date(r.time).toLocaleTimeString()))
        });
        socket.on("exchange-rates:GBP", (data: ExchangeRatesEventResponse) => {
            if(exchangeFrom !== Currency.GBP) return 
            setLiveExchangeRates(data.rates);
            setLatestRatesValues(data.latestRates.map(r => r.rates.USD))
            setLatestRatesDates(data.latestRates.map(r => new Date(r.time).toLocaleTimeString()))
        });

        return () => {
            socket.off("exchange-rates:USD");
            socket.off("exchange-rates:GBP");
        };
    }, [exchangeFrom, toast]);

    useEffect(() => {
        socket.on("exchange-failed", () => {
            toast({ message: "something went wrong!", status: "error" });
            setIsProcessing(false)
        })
        socket.on("exchange-made", async (exchange: Exchange) => {
            toast({ message: "Exchange made", status: "success" });
            setIsProcessing(false)
            await updateUser();
        })

        return () => {
            socket.off("exchange-failed")
            socket.off("exchange-made")
        }
    }, [])

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

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isProcessing) {
            intervalId = setInterval(() => {
            setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            setSeconds(0)
        }

        return () => clearInterval(intervalId);
    }, [isProcessing]); 

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.content}>
                <section className={styles.walletContainer}>
                    <div className={styles.wallet}>
                        <h2 className={styles.amount}>
                            {getSign(Currency.USD)}{user ? user.wallet.USD.toFixed(2) : "0.00"}
                        </h2>
                        <span className={styles.type}>{t("usd-wallet-title")}</span>
                        <button
                            className={styles.addFundsBtn}
                            onClick={() => handleAddFundsButtonClick(Currency.USD)}
                            data-testid="add-funds-btn-usd"
                        >
                            {t("button.add-funds")}
                        </button>
                    </div>
                    <div className={styles.wallet}>
                        <h2 className={styles.amount}>
                            {getSign(Currency.GBP)}{user ? user.wallet.GBP.toFixed(2) : "0.00"}
                        </h2>
                        <span className={styles.type}>{t("gbp-wallet-title")}</span>
                        <button
                            className={styles.addFundsBtn}
                            onClick={() => handleAddFundsButtonClick(Currency.GBP)}
                        >
                            {t("button.add-funds")}
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
                        <div className={styles.leftSide}>
                            <div className={styles.pingContainer}>
                                <div className={styles.ping}>
                                    <div></div>
                                </div>
                            </div>
                            <h3>{t("live-exchange-rate-section-title")}</h3>
                        </div>
                        <div className={styles.rightSide}>
                            <CurrencyDropdown
                                selectClassName={styles.chartDropdownSelect}
                                value={exchangeFrom}
                                onSelectChange={setExchangeFrom}
                                showInput={false} 
                            />
                            <Image
                                src={rightArrow}
                                alt="arrow"
                                className={styles.arrowImg}
                                width={20}
                                height={20}
                            />
                            <CurrencyDropdown
                                selectClassName={styles.chartDropdownSelect}
                                showInput={false} 
                                value={toCurrency}
                                onSelectChange={c => c === Currency.USD 
                                    ? setExchangeFrom(Currency.GBP)
                                    : setExchangeFrom(Currency.USD)}
                            />
                        </div>
                    </div>

                    <div className={styles.chartContainer} ref={chartParentRef}>
                        <TimeSeriesChart
                            data={latestRatesValues} 
                            labels={latestRatesDates} 
                            width={chartWidth} 
                            height={chartHeight} 
                        />
                    </div>

                    <span className={styles.rate}>
                        {liveExchangeRates
                            ? exchangeFrom === Currency.USD 
                                ? `${liveExchangeRates.USD} USD = ${liveExchangeRates.GBP} GBP`
                                : `${liveExchangeRates.GBP} GBP = ${liveExchangeRates.USD} USD`
                            : "..."}
                    </span>
                </section>

                <section className={styles.exchangeCurrencyContainer}>
                    <h3>{t("exchange-currency-section-title")}</h3>

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
                                testId="reference-input"
                                readOnly
                            />
                        </div>
                    </form>

                    <button form="myform" type="submit" className={styles.exchangeBtn} disabled={isProcessing}>
                        {!isProcessing ? t("exchange-btn") : `${seconds}s`}
                    </button>
                    <a href="/trade-history">{t("see-history-link")}</a>
                </section>
            </div>
        </div>
    );
}
