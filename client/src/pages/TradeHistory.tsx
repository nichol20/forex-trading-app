import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Header } from "../components/Header";
import { Exchange } from "../types/exchange";
import { getExchangeHistory } from "../utils/api";

import styles from "../styles/TradeHistory.module.scss";
import { Pagination } from "../components/Pagination";
import { useToast } from "../contexts/Toast";
import { isValidSortBy, SortBy } from "../utils/params";
import { useLocation } from "react-router";

const columns: string[] = [
    "Date",
    "From",
    "To",
    "Amount",
    "Rate",
    "Output"
]

export default function TradeHistory() {
    const toast = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    const [history, setHistory] = useState<Exchange[]>([]);
    const [searchParams] = useSearchParams();
    const [totalPages, setTotalPages] = useState(0);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const sortParam = searchParams.get("sortBy");
    const sortBy: SortBy = isValidSortBy(sortParam) ? sortParam : SortBy.DATE;
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const handleNavigate = (param: string, value: string) => {
        const params = new URLSearchParams(location.search);
        params.set(param, value);

        navigate(`${location.pathname}?${params.toString()}`, {
            replace: false
        });
    };

    const changeOrderBy = (col: string) => {
        if (sortBy === col.toLocaleLowerCase()) {
            handleNavigate("sortOrder", sortOrder === "asc" ? "desc" : "asc")
            return
        }
        handleNavigate("sortBy", col.toLocaleLowerCase())
    }

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getExchangeHistory({
                    page,
                    limit,
                    sortBy,
                    sortOrder
                });
                setTotalPages(res.totalPages)
                setHistory(res.history);
            } catch (error: any) {
                if (error.response?.status === 400) {
                    return setHistory([])
                }

                toast({ message: "Something went wrong", status: "error" });
            }
        };

        fetchHistory();
    }, [searchParams, page, limit, sortBy, toast, sortOrder]);

    return (
        <div className={styles.tradeHistoryPage}>
            <Header />
            <div className={styles.content}>
                <h2 className={styles.title}>Trade History</h2>
                <div className={styles.table}>
                    <div className={styles.header}>
                        {columns.map(col => (
                            <div className={styles.col} key={col} onClick={() => changeOrderBy(col)}>
                                <span className={styles.name}>{col}</span>
                                {
                                    sortBy === col.toLocaleLowerCase()
                                    && <div className={`${styles.triangle} ${styles[sortOrder]}`}></div>
                                }
                            </div>
                        ))}
                    </div>
                    <div className={styles.rows} data-testid="rows">
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
                <Pagination currentPage={page} lastPage={totalPages} />
            </div>
        </div>
    );
}
