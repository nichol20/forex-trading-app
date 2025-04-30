
import { ChangeEvent, useState } from "react"
import styles from "./style.module.scss"

interface SliderProps {
    min: number
    max: number
    step: number
    prefix: string
    onChange: (values: [number, number]) => void
}

export const Slider = ({ min, max, step, prefix, onChange }: SliderProps) => {
    const [value, setValue] = useState<[number, number]>([min, 0])
    
    const getReversedValue = (value: number) => {
        return parseFloat((max - value).toFixed(2))
    }
    
    const getPorcentageValue = (index: 0 | 1) => {
        const result = value[index] * 100 / max
        return `${result}%`
    }
    
    const handleChange = (event: ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
        const targetValue = parseFloat(event.target.value)
        
        if (index === 0) {
            if (targetValue + value[1] > max) {
                return
            }

            const reversedValue = getReversedValue(value[1])
            setValue([targetValue, value[1]])
            return onChange([targetValue, reversedValue])
        }
        
        
        if (value[0] + targetValue > max || targetValue === max) {
            return
        }
        
        const reversedValue = getReversedValue(targetValue)
        setValue([value[0], targetValue])
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
                        value={value[1]}
                        onChange={e => handleChange(e, 1)}
                        className={`${styles.rangeInput} ${styles.rightRange}`}
                    />
                </div>
            </div>

            <div className={styles.labels}>
                <span>{prefix}{value[0]}</span>
                <span>{rightInputValue === max ? "max" : `${prefix}${rightInputValue}`}</span>
            </div>
        </div>
    );
};