import { memo, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'

import CrossIcon from '@app/popup/assets/icons/cross.svg'

import { DomHolder } from '../DomHolder'
import { Portal } from '../Portal'

import './SlidingPanel.scss'

type Props = PropsWithChildren<{
    className?: string;
    showClose?: boolean;
    closeOnBackdropClick?: boolean;
    fullHeight?: boolean;
    whiteBg?: boolean;
    active: boolean;
    onClose?(): void;
    onClosed?(): void;
}>;

export const SlidingPanel = memo((props: Props): JSX.Element => {
    const {
        active,
        children,
        className,
        showClose = true,
        closeOnBackdropClick = true,
        fullHeight = false,
        whiteBg = false,
        onClose,
        onClosed,
    } = props
    const [mounted, setMounted] = useState(false)
    const ref = useRef(null)
    const classname = classNames('sliding-panel', className, {
        _fullheight: fullHeight,
        _whitebg: whiteBg,
        _hasclose: showClose,
    })

    // appear workaround
    useEffect(() => setMounted(true), [])

    return (
        <Portal id="sliding-panel-container">
            <CSSTransition
                mountOnEnter
                unmountOnExit
                classNames="transition"
                nodeRef={ref}
                in={mounted && active}
                timeout={300}
                onExited={onClosed}
            >
                <div ref={ref} className={classname}>
                    <div className="sliding-panel__backdrop" onClick={closeOnBackdropClick ? onClose : undefined} />
                    <div className="sliding-panel__container">
                        <div className="sliding-panel__content">
                            {showClose && (
                                <div className="sliding-panel__close">
                                    <button className="sliding-panel__close-button" type="button" onClick={onClose}>
                                        <CrossIcon />
                                    </button>
                                </div>
                            )}
                            <DomHolder>
                                {children}
                            </DomHolder>
                        </div>
                    </div>
                </div>
            </CSSTransition>
        </Portal>
    )
})
