import { exitIcon } from "../../assets"
import { useAuth } from "../../contexts/Auth"
import styles from "./style.module.scss"

export const Header = () => {
    const { logout } = useAuth();
    return (
        <header className={styles.header}>
            <h1 className={styles.logo}>
                <a href="/">Forex trading</a>
            </h1>
            <button className={styles.logoutBtn} onClick={logout}>
                <img  src={exitIcon} alt="exit"/>
            </button>
        </header>
    )
} 