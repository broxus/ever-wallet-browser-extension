import * as React from 'react'
import * as ReactDOM from 'react-dom'
import classNames from 'classnames'

import { PageHook } from '@app/popup/modules/shared/hooks/usePage'

import styles from './index.module.scss'

type Props = {
    page: PageHook
    id?: string
    className?: string
    animated?: boolean
} & React.PropsWithChildren

export const Page: React.FC<Props> = ({
    page,
    id,
    className,
    animated,
    children,
}) => ReactDOM.createPortal(
    <div
        id={id}
        className={classNames(
            styles.root,
            { [styles.closed]:  page.closed },
            { [styles.animated]: animated },
            className,
        )}
    >
        {children}
    </div>,
    document.body,
)
