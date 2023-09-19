import { memo, useCallback, useEffect, useMemo, useState } from 'react'
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
    const calculatedStart = Math.trunc(page / pageLength) * pageLength
    const [start, setStart] = useState(calculatedStart)

    const interval = useMemo(() => new Array(pageLength).fill(0).map(
        (_, index) => start + index,
    ) as Interval, [start])

    const hadnlePrev = useCallback(() => setStart((value) => value - pageLength), [])
    const hadnleNext = useCallback(() => setStart((value) => value + pageLength), [])

    useEffect(() => setStart(calculatedStart), [calculatedStart])

    return (
        <div className={styles.pagination}>
            <button
                type="button"
                className={styles.arrow}
                disabled={start === 0}
                onClick={hadnlePrev}
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
                disabled={start + pageLength >= totalPages}
                onClick={hadnleNext}
            >
                {Icons.chevronRight}
            </button>
        </div>
    )
})
