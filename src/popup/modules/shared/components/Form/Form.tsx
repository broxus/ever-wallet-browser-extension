import { HTMLAttributes, memo } from 'react'
import classNames from 'classnames'

import './Form.scss'

type Props = HTMLAttributes<HTMLFormElement>

export const Form = memo(({ className, ...props }: Props): JSX.Element => (
    <form {...props} className={classNames('form', className)} />
))
