import classNames from 'classnames'
import { memo, PropsWithChildren, ReactNode, useState } from 'react'

import { Icons } from '@app/popup/icons'

import styles from './ParamsPanel.module.scss'

type Props = PropsWithChildren<{
    className?: string;
    title?: ReactNode;
    collapsible?: boolean;
}>;

type ParamProps = PropsWithChildren<{
    className?: string;
    row?: boolean;
    label?: ReactNode;
}>;

function InternalParamsPanel({ className, title, collapsible, children }: Props): JSX.Element {
    const [collapsed, setCollapsed] = useState(!!collapsible)
    const toggle = () => setCollapsed((value) => !value)

    return (
        <div className={classNames(styles.panel, className)}>
            {title && (
                <div className={styles.title}>{title}</div>
            )}
            {!collapsed && children}
            {collapsible && (
                <button
                    type="button"
                    className={classNames(styles.handle, { [styles._collapsed]: collapsed })}
                    onClick={toggle}
                >
                    {Icons.chevronUp}
                </button>
            )}
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
