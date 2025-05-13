import Image from "next/image";

import { exitIcon } from "../../assets";
import { useAuth } from "../../contexts/Auth";
import { LanguageDropdown } from "../LanguageDropdown";

import styles from "./styles.module.scss";

export const Header = () => {
    const { logout } = useAuth();

    return (
        <header className={styles.header}>
            <h1 className={styles.logo}>
                <a href="/">Forex trading</a>
            </h1>
            <div className={styles.rightSide}>
                <LanguageDropdown />
                <button className={styles.logoutBtn} onClick={logout}>
                    <Image src={exitIcon} alt="exit" width={15} height={20}/>
                </button>
            </div>
        </header>
    )
} 