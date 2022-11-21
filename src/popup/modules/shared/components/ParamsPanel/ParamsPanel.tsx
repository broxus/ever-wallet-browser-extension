import classNames from 'classnames'
import { memo, PropsWithChildren, ReactNode } from 'react'

import './ParamsPanel.scss'

type Props = PropsWithChildren<{
    className?: string;
    type?: 'default' | 'transparent';
}>;

type ParamProps = PropsWithChildren<{
    className?: string;
    row?: boolean;
    label: ReactNode;
}>;

function InternalParamsPanel({ className, type, children }: Props): JSX.Element {
    return (
        <div className={classNames('params-panel', `_type-${type ?? 'default'}`, className)}>
            {children}
        </div>
    )
}

function Param({ className, row, label, children }: ParamProps): JSX.Element {
    return (
        <div className={classNames('params-panel__param', row ? '_row' : '_column', className)}>
            <div className="params-panel__param-label">{label}</div>
            <div className="params-panel__param-value">{children}</div>
        </div>
    )
}

export const ParamsPanel = memo(InternalParamsPanel) as any as typeof InternalParamsPanel & {
    Param: typeof Param,
}

ParamsPanel.Param = memo(Param) as any
