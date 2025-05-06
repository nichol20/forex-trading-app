
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

import { chevronForwardIcon } from "@/assets"
import styles from "./styles.module.scss"

interface PaginationProps {
    currentPage: number
    lastPage: number
}

export const Pagination = ({ currentPage, lastPage }: PaginationProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const hasPreviousPage = currentPage > 1;
    const hasNextPage = currentPage < lastPage;
    const isSinglePage = lastPage <= 1;

    if (isSinglePage) return null;

    const handleNavigate = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));

        router.replace(`${pathname}?${params.toString()}`);
    };

    const shouldShowPage = (index: number) => {
        const isFirstOrLast = index === 1 || index === lastPage;
        const isNearCurrent = Math.abs(currentPage - index) <= 2;
        return isFirstOrLast || isNearCurrent;
    };

    const shouldShowEllipsis = (index: number) => {
        const isAtLeast4AwayFromLastPage = index === currentPage + 3 && index !== lastPage;
        const isAtLeast4AwayFromFirstPage = index === currentPage - 3 && index !== 1;
        return isAtLeast4AwayFromLastPage || isAtLeast4AwayFromFirstPage;
    };

    const renderPageItems = () => {
        const pages = [];

        for (let index = 1; index <= lastPage; index++) {
            if (shouldShowPage(index)) {
                pages.push(
                    <li
                        key={index}
                        className={`${styles.pageItem} ${currentPage === index ? styles.active : ''}`}
                        onClick={() => handleNavigate(index)}
                    >
                        {index}
                    </li>
                );
            }

            if (shouldShowEllipsis(index)) {
                pages.push(
                    <li key={`ellipsis-${index}`} className={styles.ellipsis}>
                        ...
                    </li>
                );
            }
        }

        return pages
    };

    return (
        <ul className={styles.pagination}>
            {
                hasPreviousPage && (
                    <li className={styles.pageItem} onClick={() => handleNavigate(currentPage - 1)}>
                        <Image src={chevronForwardIcon} alt="chevron" className={styles.icon} />
                    </li>
                )
            }
            {renderPageItems()}
            {
                hasNextPage && (
                    <li className={styles.pageItem} onClick={() => handleNavigate(currentPage + 1)}>
                        <Image src={chevronForwardIcon} alt="chevron" className={styles.icon} />
                    </li>
                )
            }
        </ul>
    )
}