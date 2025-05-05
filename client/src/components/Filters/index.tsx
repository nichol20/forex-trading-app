import { useLocation, useNavigate } from "react-router";

import { InputField } from "../InputField";
import { CurrencyDropdown } from "../CurrencyDropdown";
import { DoubleSlider } from "../DoubleSlider";
import { ChangeEvent, useEffect, useState } from "react";
import { Filters as IFilters } from "../../utils/api";
import { Currency, getSign } from "../../utils/currency";
import { Modal } from "../Modal";

import styles from "./style.module.scss";
import { toUtcDateString } from "../../utils/date";

interface FiltersDesktopProps {
    isOpen: boolean
}

const INITIAL_FILTERS: IFilters = {
    end: null,
    start: null,
    minAmount: null,
    maxAmount: null,
    minOutput: null,
    maxOutput: null,
    minRate: null,
    maxRate: null,
    from: Currency.USD,
    to: Currency.GBP
}

export const FiltersDesktop = ({ isOpen }: FiltersDesktopProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<IFilters>(INITIAL_FILTERS)

    const applySettings = () => {
        const params = clearAll(true) as URLSearchParams;

        const f: IFilters = {
            ...filters,
            minAmount: filters.minAmount === 0 ? null : filters.minAmount,
            maxAmount: filters.maxAmount === 1000 ? null : filters.maxAmount,
            minOutput: filters.minOutput === 0 ? null : filters.minOutput,
            maxOutput: filters.maxOutput === 1000 ? null : filters.maxOutput,
            minRate: filters.minRate === 0 ? null : filters.minRate,
            maxRate: filters.maxRate === 2 ? null : filters.maxRate
        }

        Object.keys(f).forEach(k => {
            const key = k as keyof IFilters
            if (f[key]) {
                params.set(key, String(f[key]));
            }
        });

        navigate(`${location.pathname}?${params.toString()}`, {
            replace: false
        });
    }

    const clearAll = (shouldReturnParams?: boolean) => {
        const params = new URLSearchParams(location.search);
        
        Object.keys(filters).forEach(k => {
            const key = k as keyof IFilters
            params.delete(key);
        })
    
        if(shouldReturnParams) return params

        setFilters(INITIAL_FILTERS);
        
        navigate(`${location.pathname}?${params.toString()}`, {
            replace: false
        });
    }

    const handleDateInput = (event: ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
        const date = new Date(event.target.value)

        if(isNaN(date.getTime())) {
            setFilters(prev => ({
                ...prev,
                [type]: null
            }))
            return
        }
        
        setFilters(prev => ({
            ...prev,
            [type]: date.toISOString()
        }))
    }

    const handleCurrencyDropdownChange = (currency: Currency, type: "from" | "to") => {
        setFilters(prev => {
            const newFilters = {...prev}
            if(type === "from" && currency === newFilters.to) {
                newFilters.from = currency
                if(currency === Currency.USD) newFilters.to = Currency.GBP
                else newFilters.to = Currency.USD
            }

            if(type === "to" && currency === newFilters.from) {
                newFilters.to = currency
                if(currency === Currency.USD) newFilters.from = Currency.GBP
                else newFilters.from = Currency.USD
            }

            return newFilters
        })
    }

    useEffect(() => {
        if(isOpen) {
            requestAnimationFrame(() => {
                const filtersEl = document.querySelector(`.${styles.filters}`) as HTMLDivElement
                filtersEl.classList.add(styles.active)
            })
        } else {
            requestAnimationFrame(() => {
                const filtersEl = document.querySelector(`.${styles.filters}`) as HTMLDivElement
                filtersEl.classList.remove(styles.active)
            })
        }
    }, [isOpen])

    return (
        <div className={`${styles.filters}`}>
            <div className={styles.sections}>
                <div className={styles.fromAndToSection}>
                    <div className={styles.currencyBox}>
                        <span className={styles.title}>From</span>
                        <InputField
                            type="date"
                            onChange={e => handleDateInput(e, "start")}
                            testId="date-input-from"
                            value={filters.start ? toUtcDateString(new Date(filters.start)) : ""}
                        />
                        <CurrencyDropdown
                            showInput={false}
                            onSelectChange={c => handleCurrencyDropdownChange(c, "from")}
                            value={filters.from}
                        />
                    </div>
                    <div className={styles.currencyBox}>
                        <span className={styles.title}>To</span>
                        <InputField
                            type="date"
                            onChange={e => handleDateInput(e, "end")}
                            testId="date-input-to"
                            value={filters.end ? toUtcDateString(new Date(filters.end)): ""}
                        />
                        <CurrencyDropdown
                            showInput={false}
                            onSelectChange={c => handleCurrencyDropdownChange(c, "to")}
                            value={filters.to}
                        />
                    </div>
                </div>

                <div className={styles.amountSection}>
                    <span className={styles.title}>Amount / Output / Rate</span>
                    <DoubleSlider
                        max={1000}
                        min={0}
                        value={[filters.minAmount ?? 0, filters.maxAmount ?? 1000]}
                        onChange={v => setFilters(prev => ({
                            ...prev,
                            minAmount: v[0],
                            maxAmount: v[1]
                        }))}
                        prefix={filters.from ? getSign(filters.from) : ""}
                        step={10}
                    />
                    <DoubleSlider
                        max={1000}
                        min={0}
                        value={[filters.minOutput ?? 0, filters.maxOutput ?? 1000]}
                        onChange={v => setFilters(prev => ({
                            ...prev,
                            minOutput: v[0],
                            maxOutput: v[1]
                        }))}
                        prefix={filters.to ? getSign(filters.to) : ""}
                        step={10}
                    />
                    <DoubleSlider
                        max={2}
                        min={0}
                        value={[filters.minRate ?? 0, filters.maxRate ?? 2]}
                        onChange={v => setFilters(prev => ({
                            ...prev,
                            minRate: v[0],
                            maxRate: v[1]
                        }))}
                        prefix=""
                        step={0.2}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.applyBtn} onClick={applySettings}>Apply filters</button>
                <button className={styles.clearBtn} onClick={() => clearAll()}>Clear all</button>
            </div>

        </div>
    )
}

interface FiltersMobileProps {
    isOpen: boolean
    close: () => void
}

const FiltersMobile = ({ close, isOpen }: FiltersMobileProps) => {
    if(!isOpen) return null

    return (
        <Modal close={close}>
            <span className={styles.modalTitle}>Filters</span>
            <FiltersDesktop isOpen={true} />
        </Modal>
    )
}

type FiltersProps = FiltersDesktopProps & FiltersMobileProps 

export const Filters = ({ isOpen, close }: FiltersProps) => {
    if(window.innerWidth <= 700) {
        return <FiltersMobile isOpen={isOpen} close={close} />
    }

    return <FiltersDesktop isOpen={isOpen}/>
}