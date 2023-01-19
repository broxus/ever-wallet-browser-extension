import { memo, PropsWithChildren, ReactNode } from 'react'
import classNames from 'classnames'

type Props = PropsWithChildren<{
    label: ReactNode;
    invalid?: boolean;
}>

export const FormControl = memo(({ label, invalid, children }: Props): JSX.Element => (
    <div className={classNames('form-control', { _invalid: invalid })}>
        <label className="form-control__label">
            {label}
        </label>
        {children}
    </div>
))
