import classNames from 'classnames'
import { Children, cloneElement, FunctionComponent, memo, PropsWithChildren, ReactElement } from 'react'

import styles from './Tabs.module.scss'

type Props<T extends string | number> = PropsWithChildren<{
    className?: string;
    tab?: T;
    compact?: boolean;
    onChange: (value: T) => void;
}>;

type TabProps = PropsWithChildren<{
    id: string | number,
    active: boolean;
    className?: string;
    disabled?: boolean;
    onClick: () => void;
}>;

function InternalTabs<T extends string | number>(props: Props<T>): JSX.Element {
    const { className, tab, children, compact, onChange } = props
    return (
        <div className={classNames(styles.tabs, { [styles._compact]: compact }, className)}>
            {Children.map(children as ReactElement<TabProps>[], child => {
                if (!child) return child
                return cloneElement(child, {
                    active: tab === child.props.id,
                    onClick: () => tab !== child.props.id && onChange(child.props.id as T),
                })
            })}
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Tab({ id, active, className, disabled, children, onClick }: TabProps): JSX.Element {
    return (
        <button
            type="button"
            disabled={disabled}
            className={classNames(styles.item, { [styles._active]: active }, className)}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export const Tabs = memo(InternalTabs) as any as typeof InternalTabs & {
    Tab: FunctionComponent<Omit<TabProps, 'active' | 'onClick'>>;
}

Tabs.Tab = Tab as any
