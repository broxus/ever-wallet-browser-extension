import classNames from 'classnames'
import { memo, PropsWithChildren, ReactNode, useState } from 'react'

import { Icons } from '@app/popup/icons'

import { Card } from '../Card'
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
    bold?: boolean;
}>;

function InternalParamsPanel({ className, title, collapsible, children }: Props): JSX.Element {
    const [collapsed, setCollapsed] = useState(!!collapsible)
    const toggle = () => setCollapsed((value) => !value)

    return (
        <Card className={classNames(styles.panel, className)}>
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
        </Card>
    )
}

function Param({ className, row, label, bold, children }: ParamProps): JSX.Element {
    const cls = classNames(
        styles.param,
        row ? styles._row : styles._column,
        { [styles._bold]: bold },
        className,
    )
    return (
        <div className={cls}>
            {label && <div className={styles.label}>{label}</div>}
            <div className={styles.value}>{children}</div>
        </div>
    )
}

export const ParamsPanel = memo(InternalParamsPanel) as any as typeof InternalParamsPanel & {
    Param: typeof Param,
}

ParamsPanel.Param = memo(Param) as any
