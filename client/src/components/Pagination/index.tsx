import { useNavigate } from "react-router"

import { chevronForwardIcon } from "../../assets"
import styles from "./style.module.scss"
import { useLocation } from "react-router"

interface PaginationProps {
    currentPage: number
    lastPage: number
}

export const Pagination = ({ currentPage, lastPage }: PaginationProps) => {
    const location = useLocation()
    const navigate = useNavigate()
    const hasPreviousPage = currentPage > 1;
    const hasNextPage = currentPage < lastPage;
    const isSinglePage = lastPage <= 1;

    if (isSinglePage) return null;

    const handleNavigate = (page: number) => {
        const params = new URLSearchParams(location.search);
        params.set('page', String(page));

        navigate(`${location.pathname}?${params.toString()}`, {
            replace: false
        });
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
                        className={`${styles.page_item} ${currentPage === index ? styles.active : ''}`}
                        onClick={() => handleNavigate(index)}
                    >
                        {index}
                    </li>
                );
            }

            if (shouldShowEllipsis(index)) {
                pages.push(
                    <li key={`ellipsis-${index}`}>
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
                    <li className={styles.page_item} onClick={() => handleNavigate(currentPage - 1)}>
                        <img src={chevronForwardIcon} alt="chevron" className={styles.icon} />
                    </li>
                )
            }
            {renderPageItems()}
            {
                hasNextPage && (
                    <li className={styles.page_item} onClick={() => handleNavigate(currentPage + 1)}>
                        <img src={chevronForwardIcon} alt="chevron" className={styles.icon} />
                    </li>
                )
            }
        </ul>
    )
}