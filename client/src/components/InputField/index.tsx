"use client"
import { CSSProperties, useState } from 'react'

import { eyeIcon, blockedEyeIcon } from '../../assets'
import { ErrorMessage } from '../ErrorMessage'
import styles from './style.module.scss'

interface InputFieldProps {
    name?: string
    type: React.HTMLInputTypeAttribute
    title?: string
    inputId?: string
    className?: string
    required?: boolean
    placeholder?: string
    defaultValue?: string | number | readonly string[] | null
    value?: string | number | readonly string[]
    prefix?: string
    min?: string | number
    step?: string | number
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    errorMessage?: string
    readOnly?: boolean
    disabled?: boolean
}

const InputField = ({
    title,
    name,
    type,
    inputId,
    className,
    required,
    placeholder,
    defaultValue,
    value,
    prefix,
    min,
    step,
    onChange,
    errorMessage = "",
    readOnly = false,
    disabled
}: InputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"
    const inputBoxStyle: CSSProperties | undefined = errorMessage.length > 0 ? { borderColor: "#E70000" } : undefined

    const getType = (): React.HTMLInputTypeAttribute => {
        if (isPassword) {
            return showPassword ? "text" : "password"
        }

        return type
    }

    return (
        <div className={`${styles.inputField} ${className}`}>
            {title && <label htmlFor={inputId}>{title}</label>}
            <div className={styles.inputBox} style={inputBoxStyle}>
                {prefix && <span className={styles.prefix}>{prefix}</span>}
                <input
                    type={getType()}
                    name={name}
                    id={inputId}
                    placeholder={placeholder}
                    spellCheck={false}
                    value={value}
                    defaultValue={defaultValue ? defaultValue : undefined}
                    min={min}
                    step={step}
                    onChange={onChange}
                    required={required}
                    readOnly={readOnly}
                    disabled={disabled}
                />
                {isPassword && (
                    <button
                        className={styles.showPasswordBtn}
                        onClick={() => setShowPassword(prev => !prev)}
                        type='button'
                    >
                        <img
                            src={showPassword ? eyeIcon : blockedEyeIcon}
                            alt={showPassword ? "eye" : "blocked eye"}
                        />
                    </button>
                )}
            </div>
            {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>
    )
}

export {
    InputField
}