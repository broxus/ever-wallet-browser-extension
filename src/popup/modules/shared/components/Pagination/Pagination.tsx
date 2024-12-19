import { memo, useMemo } from 'react'
import classNames from 'classnames'

import { Icon } from '@app/popup/modules/shared/components/Icon'
import { Button } from '@app/popup/modules/shared/components/Button'
import { Space } from '@app/popup/modules/shared/components/Space'

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
        <Space direction="row" gap="s" className={styles.root}>
            <Button
                size="s"
                design="neutral"
                shape="square"
                type="button"
                disabled={page === 0}
                onClick={() => onChange(page - 1)}
            >
                <Icon icon="chevronLeft" width={16} height={16} />
            </Button>

            <Space direction="row" className={styles.pages}>
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
            </Space>

            <Button
                size="s"
                design="neutral"
                shape="square"
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => onChange(page + 1)}
            >
                <Icon icon="chevronRight" width={16} height={16} />
            </Button>
        </Space>
    )
})
