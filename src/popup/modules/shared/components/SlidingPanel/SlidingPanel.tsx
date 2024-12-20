import { memo, PropsWithChildren, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'

import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'

import { DomHolder } from '../DomHolder'
import { Portal } from '../Portal'

import './SlidingPanel.scss'

type Props = PropsWithChildren<{
    title?: ReactNode;
    className?: string;
    showClose?: boolean;
    closeOnBackdropClick?: boolean;
    fullHeight?: boolean;
    whiteBg?: boolean;
    active: boolean;
    onClose?(): void;
    onClosed?(): void;
}>;

let counter = 0

export const SlidingPanel = memo((props: Props): JSX.Element => {
    const {
        title,
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
        _hasclose: showClose || title,
    })

    const handleEnter = useCallback(() => {
        counter += 1
        document.body.classList.add('has-slider')
    }, [])
    const handleExit = useCallback(() => {
        if (--counter === 0) {
            document.body.classList.remove('has-slider')
        }
    }, [])

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
                onEnter={handleEnter}
                onExit={handleExit}
                onExited={onClosed}
            >
                <div ref={ref}>
                    <div className={classname}>
                        <div className="sliding-panel__backdrop" onClick={closeOnBackdropClick ? onClose : undefined} />
                        <div className="sliding-panel__container">
                            <div className="sliding-panel__content">
                                {(showClose || title) && (
                                    <SlidingPanelHeader
                                        onClose={onClose}
                                        title={title}
                                        showClose={showClose}
                                    />
                                )}
                                <DomHolder>
                                    {children}
                                </DomHolder>
                            </div>
                        </div>
                    </div>
                </div>
            </CSSTransition>
        </Portal>
    )
})
