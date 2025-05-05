
import { ChangeEvent } from "react"
import styles from "./style.module.scss"

interface DoubleSliderProps {
    min: number
    max: number
    step: number
    prefix: string
    onChange: (values: [number, number]) => void
    value: [number, number]
}

export const DoubleSlider = ({ min, max, step, prefix, onChange, value }: DoubleSliderProps) => {
    
    const getReversedValue = (value: number) => {
        return parseFloat((max - value).toFixed(2))
    }
    
    const getPorcentageValue = (index: 0 | 1) => {
        const v = index === 0 ? value[0] : getReversedValue(value[1])
        return `${v * 100 / max}%`
    }
    
    const handleChange = (event: ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
        const targetValue = parseFloat(event.target.value)
        console.log({
            targetValue,
            index
        })
        
        if (index === 0) {
            if (targetValue + getReversedValue(value[1]) > max) {
                return
            }

            return onChange([targetValue, value[1]])
        }
           
        if (value[0] + targetValue > max || targetValue === max) {
            return
        }
        
        const reversedValue = getReversedValue(targetValue)
        return onChange([value[0], reversedValue])
    }
    
    const rightInputValue = getReversedValue(value[1])

    return (
        <div className={styles.slider}>
            <div className={`${styles.leftBar} ${styles.bar}`}>
                <div className={styles.container}>
                    <div className={styles.progressBar} style={{ width: getPorcentageValue(0) }}></div>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value[0]}
                        onChange={e => handleChange(e, 0)}
                        className={`${styles.rangeInput} ${styles.leftRange}`}
                    />
                </div>
            </div>
            <div className={`${styles.rightBar} ${styles.bar}`}>
                <div className={styles.container}>
                    <div className={styles.progressBar} style={{ width: getPorcentageValue(1) }}></div>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={rightInputValue}
                        onChange={e => handleChange(e, 1)}
                        className={`${styles.rangeInput} ${styles.rightRange}`}
                    />
                </div>
            </div>

            <div className={styles.labels}>
                <span>{prefix}{value[0]}</span>
                <span>{value[1] === max ? "max" : `${prefix}${value[1]}`}</span>
            </div>
        </div>
    );
};