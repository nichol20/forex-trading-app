"use client"
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useT } from "@/i18n/client";

import { Header } from "@/components/Header";
import { Exchange } from "@/types/exchange";
import { getExchangeHistory } from "@/utils/api";
import { Pagination } from "@/components/Pagination";
import { isValidSortBy, SortBy } from "@/utils/params";
import { funnelIcon } from "@/assets";
import { Filters } from "@/components/Filters";
import { Currency } from "@/utils/currency";

import styles from "./styles.module.scss";

export default function TradeHistory() {
    const { t } = useT("history-page");
    const router = useRouter();
    const columns: string[] = [
        t("columns.date"), t("columns.from"), t("columns.to"),
        t("columns.amount"), t("columns.rate"), t("columns.output")
    ]
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [history, setHistory] = useState<Exchange[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilters, setShowFilters] = useState(false)

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const sortParam = searchParams.get("sortBy");
    const sortBy: SortBy = isValidSortBy(sortParam) ? sortParam : SortBy.DATE;
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const handleNavigate = (param: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(param, value);

        router.replace(`${pathname}?${params.toString()}`);
    };

    const changeOrderBy = (col: string) => {
        if (sortBy === col.toLocaleLowerCase()) {
            handleNavigate("sortOrder", sortOrder === "asc" ? "desc" : "asc")
            return
        }
        handleNavigate("sortBy", col.toLocaleLowerCase())
    }

    useEffect(() => {
        const minAmount = searchParams.get("minAmount")
        const maxAmount = searchParams.get("maxAmount")
        const minOutput = searchParams.get("minOutput")
        const maxOutput = searchParams.get("maxOutput")
        const minRate = searchParams.get("minRate")
        const maxRate = searchParams.get("maxRate")
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
                        minAmount: minAmount ? parseInt(minAmount) : null,
                        maxAmount: maxAmount ? parseInt(maxAmount) : null,
                        minOutput: minOutput ? parseInt(minOutput) : null,
                        maxOutput: maxOutput ? parseInt(maxOutput) : null,
                        minRate: minRate ? parseInt(minRate) : null,
                        maxRate: maxRate ? parseInt(maxRate) : null,
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
            }
        };

        fetchHistory();
    }, [searchParams, page, limit, sortBy, sortOrder]);

    return (
        <div className={styles.tradeHistoryPage}>
            <main className={styles.content}>
                <section className={`${styles.filterContainer} ${styles.section}`}>
                    <button className={styles.filterBtn} onClick={() => setShowFilters(prev => !prev)}>
                        <Image src={funnelIcon} alt="funnel" />
                        <span>Filter</span>
                    </button>
                    <Filters isOpen={showFilters} close={() => setShowFilters(false)} />
                </section>
                <section className={`${styles.tableContainer} ${styles.section}`}>
                    <h2 className={styles.title}>{t("title")}</h2>
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
