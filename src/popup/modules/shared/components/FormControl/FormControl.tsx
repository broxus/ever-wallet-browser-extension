import { memo, PropsWithChildren, ReactNode } from 'react'
import classNames from 'classnames'

import './FormControl.scss'

type Props = PropsWithChildren<{
    label: ReactNode;
    className?: string;
    invalid?: boolean;
}>

export const FormControl = memo(({ label, invalid, className, children }: Props): JSX.Element => (
    <div className={classNames('form-control', className, { _invalid: invalid })}>
        <label className="form-control__label">
            {label}
        </label>
        {children}
    </div>
))
