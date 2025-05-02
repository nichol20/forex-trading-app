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
import { funnelIcon } from "../assets";
import { Filters } from "../components/Filters";
import { Currency } from "../utils/currency";

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
    const [searchParams] = useSearchParams();

    const [history, setHistory] = useState<Exchange[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilters, setShowFilters] = useState(false)

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
        const minAmount = parseInt(searchParams.get("minAmount") ?? "0", 10)
        const maxAmount = parseInt(searchParams.get("maxAmount") ?? "1000", 10)
        const minOutput = parseInt(searchParams.get("minOutput") ?? "0", 10)
        const maxOutput = parseInt(searchParams.get("maxOutput") ?? "1000", 10)
        const minRate = parseFloat(searchParams.get("minRate") ?? "0")
        const maxRate = parseFloat(searchParams.get("maxRate") ?? "2")
        const from = searchParams.get("from")
        const to = searchParams.get("to")

        const fetchHistory = async () => {
            try {
                const res = await getExchangeHistory({
                    page,
                    limit,
                    sortBy,
                    sortOrder,
                    filters: {
                        minAmount,
                        maxAmount,
                        minOutput,
                        maxOutput,
                        minRate,
                        maxRate,
                        start: searchParams.get("start"),
                        end: searchParams.get("end"),
                        from: from ? from as Currency : null,
                        to: to ? to as Currency : null
                    }
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
            <main className={styles.content}>
                <section className={styles.filterContainer}>
                    <button className={styles.filterBtn} onClick={() => setShowFilters(prev => !prev)}>
                        <img src={funnelIcon} alt="funnel" />
                        <span>Filter</span>
                    </button>
                    <Filters isOpen={showFilters} close={() => setShowFilters(false)} />
                </section>
                <section className={styles.tableContainer}>
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
                                            {exchange.toAmount.toFixed(6)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Pagination currentPage={page} lastPage={totalPages} />
                </section>
            </main>
        </div>
    );
}
