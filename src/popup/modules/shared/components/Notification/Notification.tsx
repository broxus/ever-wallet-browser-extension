import classNames from 'classnames'
import React, { memo, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'

import Close from '@app/popup/assets/img/close.svg'

import { Portal } from '../Portal'

import './Notification.scss'

type Props = React.PropsWithChildren<{
    className?: string;
    timeout?: number;
    title?: React.ReactNode;
    opened: boolean;
    onClose: () => void;
}>;

export const Notification = memo((props: Props) => {
    const {
        className,
        title,
        children,
        timeout,
        opened,
        onClose,
    } = props

    useEffect(() => {
        const id: any = timeout ? setTimeout(onClose, timeout) : undefined
        return () => clearTimeout(id)
    }, [timeout])

    return (
        <Portal id="notification-container">
            <CSSTransition
                mountOnEnter unmountOnExit in={opened}
                timeout={300} classNames="transition"
            >
                <div className={classNames('notification', className)}>
                    {title && (<h3 className="notification__title">{title}</h3>)}
                    <div className="notification__content">
                        {children}
                    </div>
                    <button className="notification__close" type="button" onClick={onClose}>
                        <img src={Close} alt="close" />
                    </button>
                </div>
            </CSSTransition>
        </Portal>
    )
})
