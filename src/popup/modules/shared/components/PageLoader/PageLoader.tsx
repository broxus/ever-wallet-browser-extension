import { memo, PropsWithChildren } from 'react'
import classNames from 'classnames'

import { Loader } from '../Loader'
import './PageLoader.scss'

interface Props extends PropsWithChildren {
    className?: string;
    active?: boolean;
}

export const PageLoader = memo(({ className, children, active = true }: Props): JSX.Element => (
    <>
        {children}
        {active && (
            <div className={classNames('page-loader', className)}>
                <Loader />
            </div>
        )}
    </>
))
