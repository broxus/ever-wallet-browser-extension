import { memo } from 'react'
import classNames from 'classnames'

import { Loader } from '../Loader'
import './PageLoader.scss'

interface Props {
    className?: string;
}

export const PageLoader = memo(({ className }: Props): JSX.Element => (
    <div className={classNames('page-loader', className)}>
        <Loader />
    </div>
))
