import { memo, type PropsWithChildren, type ReactNode } from 'react'

import styles from './PageHeader.module.scss'

type Props = PropsWithChildren<{
    label?: ReactNode;
}>

export const PageHeader = memo(({ label, children }: Props) => (
    <div className={styles.header}>
        {label && (
            <div className={styles.label}>{label}</div>
        )}
        <div className={styles.content}>{children}</div>
    </div>
))
