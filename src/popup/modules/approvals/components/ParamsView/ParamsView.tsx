/* eslint-disable no-nested-ternary */
import { FC, memo } from 'react'
import { flatten } from 'flat'
import { useIntl } from 'react-intl'

import { Card, Space } from '@app/popup/modules/shared'

import styles from './ParamsView.module.scss'

interface Item {
    params: Object;
}

export const ParamsItem = memo(({ params }: Item): JSX.Element => (
    <>
        {Object.entries(params).map(([key, value]) => (
            <Card size="xs" className={styles.item}>
                <div className={styles.label}>{key}</div>
                <div className={styles.value}>
                    {value instanceof Array ? (
                        <pre className={styles.pre}>{JSON.stringify(value, undefined, 2)}</pre>
                    ) : (value === null || value === undefined) ? (
                        JSON.stringify(value)
                    ) : typeof value === 'object' ? (
                        <ParamsItem params={value} />
                    ) : (
                        value.toString()
                    )}
                </div>
            </Card>
        ))}
    </>
))

type Props = {
    params: Object;
}

export const ParamsView: FC<Props> = ({ params }) => {
    const intl = useIntl()

    return (
        <Space direction="column" gap="m">
            <div className={styles.title}>
                {intl.formatMessage({ id: 'METADATA' })}
            </div>
            <ParamsItem params={flatten(params)} />
        </Space>
    )
}
