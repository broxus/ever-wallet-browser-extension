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
    const ref = useRef<HTMLDivElement>(null)
    const focusTrapActivated = useRef(false)
    const previouslyFocusedElement = useRef<HTMLElement | null>(null)
    const classname = classNames('sliding-panel', className, {
        _fullheight: fullHeight,
        _whitebg: whiteBg,
        _hasclose: showClose || title,
    })

    const handleEnter = useCallback(() => {
        counter += 1
        document.body.classList.add('has-slider')
        previouslyFocusedElement.current = document.activeElement as HTMLElement
    }, [])
    const handleExit = useCallback(() => {
        if (--counter === 0) {
            document.body.classList.remove('has-slider')
        }
        if (previouslyFocusedElement.current) {
            previouslyFocusedElement.current.focus()
        }
    }, [])

    // appear workaround
    useEffect(() => setMounted(true), [])

    // trap focus
    useEffect(() => {
        if (!active) return

        setTimeout(() => {
            const panel = ref.current
            if (!panel) return

            const focusableElements = Array.from(
                panel.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                ),
            ).filter(el => !el.hasAttribute('disabled') && !el.classList.contains('hidden'))

            if (focusableElements.length === 0) return

            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    const activeElement = document.activeElement as HTMLElement

                    if (!focusTrapActivated.current) {
                        focusTrapActivated.current = true
                        if (!focusableElements.includes(activeElement)) {
                            firstElement.focus()
                            e.preventDefault()
                        }
                    }
                    else if (e.shiftKey && activeElement === firstElement) {
                        e.preventDefault()
                        lastElement.focus()
                    }
                    else if (!e.shiftKey && activeElement === lastElement) {
                        e.preventDefault()
                        firstElement.focus()
                    }
                }
            }

            document.addEventListener('keydown', handleKeyDown)

            // eslint-disable-next-line consistent-return
            return () => {
                document.removeEventListener('keydown', handleKeyDown)
            }
        }, 0)
    }, [active])

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
