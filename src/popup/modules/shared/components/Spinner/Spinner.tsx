import { memo } from 'react'
import classNames from 'classnames'

import SpinnerIcon from '@app/popup/assets/icons/spinner.svg'

import './Spinner.scss'

interface Props {
    className?: string;
}

export const Spinner = memo(({ className }: Props): JSX.Element => (
    <SpinnerIcon className={classNames('spinner', className)} />
))
