import classNames from 'classnames'
import { ForwardedRef, forwardRef, memo, PropsWithChildren, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'

import { Button } from '../Button'
import { Portal } from '../Portal'

import './Notification.scss'

export type NotificationType = 'default' | 'error' | 'success';

export interface NotificationRef {
    reset(): void; // reset timer
}

type Props = PropsWithChildren<{
    opened: boolean;
    type?: NotificationType;
    timeout?: number;
    action?: string;
    onAction?(): void;
    onClose?(): void;
    onClosed?(): void;
}>;

function InnerNotification(props: Props, ref: ForwardedRef<NotificationRef>) {
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
    const [nonce, setNonce] = useState(0) // var to reset timer
    const nodeRef = useRef(null)

    const handleAction = () => {
        try {
            onAction?.()
        }
        finally {
            onClose?.()
        }
    }

    useEffect(() => {
        const id: any = (timeout && opened && onClose) ? setTimeout(onClose, timeout) : undefined
        return () => clearTimeout(id)
    }, [timeout, opened, nonce])

    // appear workaround
    useEffect(() => setMounted(true), [])

    useImperativeHandle(ref, () => ({
        reset: () => setNonce((value) => value + 1),
    }))

    return (
        <Portal id="notification-container">
            <CSSTransition
                mountOnEnter
                unmountOnExit
                classNames="transition"
                nodeRef={nodeRef}
                in={mounted && opened}
                timeout={300}
                onExited={onClosed}
            >
                <div ref={nodeRef} className={classNames('notification', `_type-${type}`)}>
                    <div className="notification__content">
                        {children}
                    </div>
                    {action && (
                        <Button
                            className="notification__action"
                            design="transparency"
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
}

export const Notification = memo(forwardRef<NotificationRef, Props>(InnerNotification))
