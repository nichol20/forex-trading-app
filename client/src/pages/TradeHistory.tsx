import { useEffect, useState } from "react";

import { Header } from "../components/Header";
import styles from "../styles/TradeHistory.module.scss";
import { Exchange } from "../types/exchange";
import * as api from "../utils/api";
import { sortRecordsByDate } from "../utils/exchange";

export default function TradeHistory() {
    const [history, setHistory] = useState<Exchange[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const exHistory = await api.getExchangeHistory();
            const sortedHistory = sortRecordsByDate(exHistory, "descendant")
            setHistory(sortedHistory);
        };

        fetchHistory();
    }, []);

    return (
        <div className={styles.tradeHistoryPage}>
            <Header />
            <div className={styles.content}>
                <h2 className={styles.title}>Trade History</h2>
                <div className={styles.table}>
                    <div className={styles.header}>
                        <div className={styles.col}>
                            <span className={styles.name}>Date</span>
                        </div>
                        <div className={styles.col}>
                            <span className={styles.name}>From</span>
                        </div>
                        <div className={styles.col}>
                            <span className={styles.name}>To</span>
                        </div>
                        <div className={styles.col}>
                            <span className={styles.name}>Amount</span>
                        </div>
                        <div className={styles.col}>
                            <span className={styles.name}>Rate</span>
                        </div>
                        <div className={styles.col}>
                            <span className={styles.name}>Output</span>
                        </div>
                    </div>
                    <div className={styles.rows}>
                        {history.map((exchange) => (
                            <div key={exchange.id} className={styles.row}>
                                <div className={styles.item}>
                                    <span className={styles.value}>
                                        {new Date(
                                            exchange.exchangedAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.value}>
                                        {exchange.fromCurrency}
                                    </span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.value}>
                                        {exchange.toCurrency}
                                    </span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.value}>
                                        {exchange.fromAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.value}>
                                        {exchange.exchangeRate}
                                    </span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.value}>
                                        {exchange.toAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
