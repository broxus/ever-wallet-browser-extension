import * as React from 'react'
import * as ReactDOM from 'react-dom'
import ReactFocusLock from 'react-focus-lock'
import classNames from 'classnames'

import { PageHook } from '@app/popup/modules/shared/hooks/usePage'

import styles from './index.module.scss'


type Props = {
    page: PageHook;
    id?: string;
    className?: string;
    animated?: boolean;
} & React.PropsWithChildren;

export const Page: React.FC<Props> = ({
    page,
    id,
    className,
    animated,
    children,
}) => {
    const pageRef = React.useRef<HTMLDivElement>(null)

    return ReactDOM.createPortal(
        <div
            id={id}
            ref={pageRef}
            className={classNames(
                styles.root,
                { [styles.closed]: page.closed },
                { [styles.animated]: animated },
                className,
            )}
        >
            <ReactFocusLock
                autoFocus={false}
                returnFocus
            >
                {children}
            </ReactFocusLock>
        </div>,
        document.body,
    )
}
