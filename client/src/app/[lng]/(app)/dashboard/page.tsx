"use client"
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { useT } from "@/i18n/client";
import * as api from "@/utils/api";
import { socket } from "@/socket";
import { rightArrow } from "@/assets";
import { CurrencyDropdown } from "@/components/CurrencyDropdown";
import { exchangeCurrencies } from "@/utils/api";
import { Currency } from "@/utils/currency";
import { useAuth } from "@/contexts/Auth";
import { useToast } from "@/contexts/Toast";
import { Exchange, LatestRateItem, Rates } from "@/types/exchange";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";

import styles from "./styles.module.scss";
import { ExchangeRatesEventResponse } from "@/types/socket";
import { Wallets } from "@/components/Wallets";

export default function Dashboard() {
    const { t } = useT("dashboard");
    const toast = useToast();
    const { updateUser } = useAuth();
    const chartParentRef = useRef<HTMLDivElement>(null);

    const [chartWidth, setChartWidth] = useState(0);
    const [chartHeight, setChartHeight] = useState(350)

    const [seconds, setSeconds] = useState(0); 

    const [latestRates, setLatestRates] = useState<LatestRateItem[]>([])
    const [exchangeFrom, setExchangeFrom] = useState<Currency>(Currency.USD);
    const [exchangeTo, setExchangeTo] = useState<Currency>(Currency.GBP)

    const [liveExchangeRates, setLiveExchangeRates] = useState<Rates>();
    const [amountToExchange, setAmountToExchange] = useState<number>(100);
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
                exchangeTo,
                parseFloat(amount)
            );
            toast({ message: t("exchange-queued-message"), status: "success" });
        } catch (error: any) {
            setIsProcessing(false);
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

    const getReferenceValue = () => {
        if (!liveExchangeRates) return 0;

        return (amountToExchange * liveExchangeRates[exchangeTo]).toFixed(6)
    }

    const handleDropdownChange = (currency: Currency, state: "from" | "to") => {
        if(state === "from") {
            if(currency === exchangeTo) {
                setExchangeTo(exchangeFrom)
            }
            return setExchangeFrom(currency)
        }

        if(currency === exchangeFrom) {
            setExchangeFrom(exchangeTo)
        }
        return setExchangeTo(currency)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const exchangeRates = await api.getExchangeRates(exchangeFrom);
                const latestRates = await api.getLatestRates(exchangeFrom)
                setLiveExchangeRates(exchangeRates);
                setLatestRates(latestRates)
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
            setLatestRates(data.latestRates);
        });
        socket.on("exchange-rates:GBP", (data: ExchangeRatesEventResponse) => {
            if(exchangeFrom !== Currency.GBP) return 
            setLiveExchangeRates(data.rates);
            setLatestRates(data.latestRates);
        });

        return () => {
            socket.off("exchange-rates:USD");
            socket.off("exchange-rates:GBP");
        };
    }, [exchangeFrom]);

    useEffect(() => {
        socket.on("exchange-failed", () => {
            toast({ message: t("error.unknown"), status: "error" });
            setIsProcessing(false)
        })
        socket.on("exchange-made", async (exchange: Exchange) => {
            toast({ message: t("exchange-made-message", {
                from: exchange.fromCurrency,
                to: exchange.toCurrency,
                amount: exchange.fromAmount,
                output: exchange.toAmount
            }), status: "success" });
            setIsProcessing(false)
            await updateUser();
        })

        return () => {
            socket.off("exchange-failed")
            socket.off("exchange-made")
        }
    }, [toast, t])

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
                    <Wallets />
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
                                onSelectChange={c => handleDropdownChange(c, "from")}
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
                                value={exchangeTo}
                                onSelectChange={c => handleDropdownChange(c, "to")}
                            />
                        </div>
                    </div>

                    <div className={styles.chartContainer} ref={chartParentRef}>
                        <TimeSeriesChart
                            data={latestRates.map(r => r.rates[exchangeTo])} 
                            labels={latestRates.map(r => new Date(r.time).toLocaleTimeString())} 
                            width={chartWidth} 
                            height={chartHeight} 
                        />
                    </div>

                    <span className={styles.rate}>
                        {liveExchangeRates
                            ? `1 ${exchangeFrom} = ${liveExchangeRates[exchangeTo]} ${exchangeTo}`
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
                            onSelectChange={c => handleDropdownChange(c, "from")}
                            value={exchangeFrom}
                            defaultAmountValue={amountToExchange}
                            onInputChange={setAmountToExchange}
                            inputTestId="currency-dropdown-input"
                        />
                        <Image
                            src={rightArrow}
                            alt="arrow"
                            className={styles.arrowImg}
                        />
                        <CurrencyDropdown
                            selectName="toCurrency"
                            onSelectChange={c => handleDropdownChange(c, "to")}
                            value={exchangeTo}
                            amountValue={getReferenceValue()}
                            inputTestId="reference-input"
                            inputReadOnly
                        />
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
