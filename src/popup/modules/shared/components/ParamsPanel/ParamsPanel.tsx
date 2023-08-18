import classNames from 'classnames'
import { memo, PropsWithChildren, ReactNode } from 'react'

import styles from './ParamsPanel.module.scss'

type Props = PropsWithChildren<{
    className?: string;
    title?: string;
}>;

type ParamProps = PropsWithChildren<{
    className?: string;
    row?: boolean;
    label?: ReactNode;
}>;

function InternalParamsPanel({ className, title, children }: Props): JSX.Element {
    return (
        <div className={classNames(styles.panel, className)}>
            {title && (
                <div className={styles.title}>{title}</div>
            )}
            {children}
        </div>
    )
}

function Param({ className, row, label, children }: ParamProps): JSX.Element {
    return (
        <div className={classNames(styles.param, row ? styles._row : styles._column, className)}>
            {label && <div className={styles.label}>{label}</div>}
            <div className={styles.value}>{children}</div>
        </div>
    )
}

export const ParamsPanel = memo(InternalParamsPanel) as any as typeof InternalParamsPanel & {
    Param: typeof Param,
}

ParamsPanel.Param = memo(Param) as any
