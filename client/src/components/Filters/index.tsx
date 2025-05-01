import { useLocation, useNavigate } from "react-router";

import styles from "./style.module.scss";
import { InputField } from "../InputField";
import { CurrencyDropdown } from "../CurrencyDropdown";
import { Slider } from "../DoubleSlider";
import { ChangeEvent, useEffect, useState } from "react";
import { Filters as IFilters } from "../../utils/api";
import { Currency } from "../../utils/currency";
import { Modal } from "../Modal";

interface FiltersDesktopProps {
    isOpen: boolean
}

const FiltersDesktop = ({ isOpen }: FiltersDesktopProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<IFilters>({
        end: null,
        start: null,
        minAmount: 0,
        maxAmount: 1000,
        minOutput: 0,
        maxOutput: 1000,
        minRate: 0,
        maxRate: 2,
        from: Currency.USD,
        to: Currency.GBP
    })

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

        if(shouldReturnParams) {
            return params
        }
        
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
                        />
                        <CurrencyDropdown
                            showInput={false}
                            onSelectChange={c => setFilters(prev => ({
                                ...prev,
                                from: c
                            }))}
                            defaultCurrencyValue={filters.from}
                        />
                    </div>
                    <div className={styles.currencyBox}>
                        <span className={styles.title}>To</span>
                        <InputField
                            type="date"
                            onChange={e => handleDateInput(e, "end")}
                        />
                        <CurrencyDropdown
                            showInput={false}
                            onSelectChange={c => setFilters(prev => ({
                                ...prev,
                                to: c
                            }))}
                            defaultCurrencyValue={filters.to}
                        />
                    </div>
                </div>

                <div className={styles.amountSection}>
                    <span className={styles.title}>Amount / Output / Rate</span>
                    <Slider
                        max={1000}
                        min={0}
                        onChange={v => setFilters(prev => ({
                            ...prev,
                            minAmount: v[0],
                            maxAmount: v[1]
                        }))}
                        prefix="$"
                        step={10}
                    />
                    <Slider
                        max={1000}
                        min={0}
                        onChange={v => setFilters(prev => ({
                            ...prev,
                            minOutput: v[0],
                            maxOutput: v[1]
                        }))}
                        prefix="£"
                        step={10}
                    />
                    <Slider
                        max={2}
                        min={0}
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