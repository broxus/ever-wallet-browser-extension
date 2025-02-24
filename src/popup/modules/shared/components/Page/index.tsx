import * as React from 'react'
import * as ReactDOM from 'react-dom'
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
    const focusTrapActivated = React.useRef(false)

    // trap focus
    React.useEffect(() => {
        if (page.closed) return

        const pageElement = pageRef.current
        if (!pageElement) return

        const focusableElements = Array.from(
            pageElement.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
        ).filter(el => !el.hasAttribute('disabled') && !el.classList.contains('hidden'))

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (!focusTrapActivated.current) {
                    focusTrapActivated.current = true
                    firstElement.focus()
                    e.preventDefault()
                }
                else if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement.focus()
                }
                else if (!e.shiftKey && document.activeElement === lastElement) {
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
    }, [page.closed])

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
            {children}
        </div>,
        document.body,
    )
}
