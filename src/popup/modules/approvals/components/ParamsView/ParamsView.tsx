/* eslint-disable no-nested-ternary */
import { FC, memo, useState } from 'react'
import { flatten } from 'flat'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Card, Icon, Space } from '@app/popup/modules/shared'

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
    const [isOpen, setIsOpen] = useState(false)


    return (
        <Space direction="column" gap="m">
            <div className={styles.title}>
                {intl.formatMessage({ id: 'METADATA' })}
            </div>
            <Space direction="column" gap="m" className={classNames(styles.list, { [styles._active]: isOpen })}>
                <ParamsItem params={flatten(params)} />
            </Space>
            <button onClick={() => setIsOpen(p => !p)} className={styles.button}>
                <span className={styles.text}>{intl.formatMessage({ id: isOpen ? 'SHOW_LESS_METADATA' : 'SHOW_MORE_METADATA' })}</span>
                <Icon icon={isOpen ? 'chevronUp' : 'chevronDown'} color="#fff" />
            </button>
        </Space>
    )
}
