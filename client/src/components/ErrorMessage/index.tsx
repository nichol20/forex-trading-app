import styles from './style.module.scss'

interface ErrorMessageProps {
    message: string
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
    return <span className={styles.errorMessage}>{message}</span>
}