import styles from "./style.module.scss"

export const Header = () => {
    return (
        <header className={styles.header}>
            <h1 className={styles.logo}>
                <a href="/">Forex trading</a>
            </h1>
        </header>
    )
} 