import { MouseEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { supportedLngs, LanguageCode } from "@/i18n/language";
import { useT } from "@/i18n/client";

import styles from './styles.module.scss';

export const LanguageDropdown = () => {
    const { t, i18n } = useT();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const handleMouseOver = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        setOpen(true);
    }

    const handleMouseOut = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        setOpen(false);
    }

    const handleClick = (event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>, code: LanguageCode) => {
        const newPath = pathname.split("/");
        newPath[1] = code;
        router.replace(`${newPath.join("/")}?${searchParams.toString()}`);
        setOpen(false);
    }

    return (
        <div className={styles.languageDropdown}>
            <div className={styles.container} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                <div className={styles.title}>{t("language-dropdown-title")}</div>
                {open && (
                    <ul className={styles.list}>
                        {supportedLngs.map((lng, i) => (
                            <li
                                key={i}
                                onClick={e => handleClick(e, lng.code)}
                                className={styles.item}
                            >
                                {lng.name[lng.code] + " "} 
                                {
                                    lng.code !== i18n.language 
                                        ? `(${lng.name[i18n.language as LanguageCode]})` 
                                        : ""
                                }
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}