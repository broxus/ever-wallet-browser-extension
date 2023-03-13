import classNames from 'classnames'
import { memo, PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'

import Close from '@app/popup/assets/img/close.svg'

import { Portal } from '../Portal'

import './Notification.scss'

type Props = PropsWithChildren<{
    opened: boolean;
    className?: string;
    timeout?: number;
    title?: ReactNode;
    position?: 'top' | 'bottom';
    showClose?: boolean;
    onClose?(): void;
    onClosed?(): void;
}>;

export const Notification = memo((props: Props) => {
    const {
        position = 'top',
        showClose = false,
        className,
        title,
        children,
        timeout,
        opened,
        onClose,
        onClosed,
    } = props
    const [mounted, setMounted] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const id: any = (timeout && opened && onClose) ? setTimeout(onClose, timeout) : undefined
        return () => clearTimeout(id)
    }, [timeout, opened])

    // appear workaround
    useEffect(() => setMounted(true), [])

    return (
        <Portal id={`notification-container-${position}`}>
            <CSSTransition
                mountOnEnter
                unmountOnExit
                classNames="transition"
                nodeRef={ref}
                in={mounted && opened}
                timeout={300}
                onExited={onClosed}
            >
                <div ref={ref} className={classNames('notification', className)}>
                    {title && (<h3 className="notification__title">{title}</h3>)}
                    <div className="notification__content">
                        {children}
                    </div>
                    {showClose && onClose && (
                        <button className="notification__close" type="button" onClick={onClose}>
                            <img src={Close} alt="close" />
                        </button>
                    )}
                </div>
            </CSSTransition>
        </Portal>
    )
})
