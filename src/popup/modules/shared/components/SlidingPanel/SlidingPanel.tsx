import { memo, PropsWithChildren } from 'react'
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
    fullHeight = false,
}: Props): JSX.Element => (
    <Portal id="sliding-panel-container">
        <CSSTransition
            mountOnEnter
            unmountOnExit
            in={active}
            timeout={300}
            classNames="transition"
        >
            <div className={classNames('sliding-panel', { _fullheight: fullHeight }, className)}>
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
))
