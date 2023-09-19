import { memo, PropsWithChildren, ReactNode } from 'react'
import classNames from 'classnames'

import './FormControl.scss'

type Props = PropsWithChildren<{
    label?: ReactNode;
    prefix?: ReactNode;
    className?: string;
    invalid?: boolean;
}>

export const FormControl = memo(({ label, prefix, invalid, className, children }: Props): JSX.Element => (
    <div className={classNames('form-control', className, { _invalid: invalid })}>
        {label && (
            <label className="form-control__label">
                {label}
                <span className="form-control__label--prefix">
                    {prefix}
                </span>
            </label>

        )}
        {children}
    </div>
))
