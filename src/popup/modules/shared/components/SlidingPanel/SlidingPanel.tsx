import { memo } from 'react'
import * as React from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'

import { DomHolder } from '../DomHolder'

import './SlidingPanel.scss'

type Props = React.PropsWithChildren<{
    className?: string;
    showClose?: boolean;
    closeOnBackdropClick?: boolean;
    active: boolean;
    onClose: () => void;
}>;

export const SlidingPanel = memo(({
    active,
    onClose,
    children,
    className,
    showClose = true,
    closeOnBackdropClick = true,
}: Props): JSX.Element => (
    <CSSTransition
        mountOnEnter
        unmountOnExit
        in={active}
        timeout={300}
        classNames="transition"
    >
        <div className={classNames('sliding-panel', className)}>
            <div className="sliding-panel__backdrop" onClick={closeOnBackdropClick ? onClose : undefined} />
            <div className="sliding-panel__container">
                <div className="sliding-panel__content">
                    {showClose && (
                        <div className="sliding-panel__close">
                            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                            <button className="sliding-panel__close-button" type="button" onClick={onClose} />
                        </div>
                    )}
                    <DomHolder>
                        {children}
                    </DomHolder>
                </div>
            </div>
        </div>
    </CSSTransition>
))
