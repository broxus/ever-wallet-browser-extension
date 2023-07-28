import classNames from 'classnames'
import { memo, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'

import { Button } from '../Button'
import { Portal } from '../Portal'

import './Notification.scss'

export type NotificationType = 'default' | 'error' | 'success';

type Props = PropsWithChildren<{
    opened: boolean;
    type?: NotificationType;
    timeout?: number;
    action?: string;
    onAction?(): void;
    onClose?(): void;
    onClosed?(): void;
}>;

export const Notification = memo((props: Props) => {
    const {
        type = 'default',
        timeout = 3000,
        children,
        opened,
        action,
        onAction,
        onClose,
        onClosed,
    } = props
    const [mounted, setMounted] = useState(false)
    const ref = useRef(null)

    const handleAction = () => {
        onClose?.()
        onAction?.()
    }

    useEffect(() => {
        const id: any = (timeout && opened && onClose) ? setTimeout(onClose, timeout) : undefined
        return () => clearTimeout(id)
    }, [timeout, opened])

    // appear workaround
    useEffect(() => setMounted(true), [])

    return (
        <Portal id="notification-container">
            <CSSTransition
                mountOnEnter
                unmountOnExit
                classNames="transition"
                nodeRef={ref}
                in={mounted && opened}
                timeout={300}
                onExited={onClosed}
            >
                <div ref={ref} className={classNames('notification', `_type-${type}`)}>
                    <div className="notification__content">
                        {children}
                    </div>
                    {action && (
                        <Button
                            className="notification__action"
                            design="secondary"
                            size="s"
                            onClick={handleAction}
                        >
                            {action}
                        </Button>
                    )}
                </div>
            </CSSTransition>
        </Portal>
    )
})
