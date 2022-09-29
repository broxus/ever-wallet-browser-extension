import classNames from 'classnames'
import {
    Children, cloneElement, FunctionComponent, memo, ReactElement,
} from 'react'
import * as React from 'react'

import './Tabs.scss'

type Props<T extends string | number> = React.PropsWithChildren<{
    className?: string;
    tab: T;
    onChange: (value: T) => void;
}>;

type TabProps = React.PropsWithChildren<{
    id: string | number,
    active: boolean;
    className?: string;
    disabled?: boolean;
    onClick: () => void;
}>;

function InternalTabs<T extends string | number>({ className, tab, children, onChange }: Props<T>): JSX.Element {
    return (
        <div className={classNames('tabs', className)}>
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
            className={classNames('tabs__item', { _active: active }, className)}
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
