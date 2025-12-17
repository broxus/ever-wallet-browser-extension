import { memo, type PropsWithChildren } from 'react'
import classNames from 'classnames'

import { Loader } from '../Loader'
import './PageLoader.scss'

interface Props extends PropsWithChildren {
    className?: string;
    active?: boolean;
}

export const PageLoader = memo(({ className, children, active = true }: Props) => (
    <>
        {children}
        {active && (
            <div className={classNames('page-loader', className)}>
                <Loader large />
            </div>
        )}
    </>
))
