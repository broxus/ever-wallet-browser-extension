import { memo, useMemo } from 'react'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'

import styles from './Pagination.module.scss'

interface Props {
    page: number;
    pageLength?: number;
    totalPages: number;
    onChange(page: number): void;
}

type Interval = [number, number, number, number, number]

const PAGE_LENGTH = 5

export const Pagination = memo(({ page, pageLength = PAGE_LENGTH, totalPages, onChange }: Props): JSX.Element => {
    const interval = useMemo(() => new Array(pageLength).fill(0).map(
        (_, index) => Math.trunc(page / pageLength) * pageLength + index,
    ) as Interval, [page, pageLength])

    return (
        <div className={styles.pagination}>
            <button
                type="button"
                className={styles.arrow}
                disabled={page === 0}
                onClick={() => onChange(page - 1)}
            >
                {Icons.chevronLeft}
            </button>

            {interval.map((value) => (
                <button
                    type="button"
                    key={value}
                    className={classNames(styles.page, {
                        [styles._active]: value === page,
                        [styles._hidden]: value >= totalPages,
                    })}
                    onClick={() => onChange(value)}
                >
                    {value + 1}
                </button>
            ))}

            <button
                type="button"
                className={styles.arrow}
                disabled={page >= totalPages - 1}
                onClick={() => onChange(page + 1)}
            >
                {Icons.chevronRight}
            </button>
        </div>
    )
})
