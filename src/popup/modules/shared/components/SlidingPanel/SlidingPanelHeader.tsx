import * as React from 'react'
import classNames from 'classnames'

import { Button } from '@app/popup/modules/shared/components/Button'
import { Icon } from '@app/popup/modules/shared/components/Icon'
import './SlidingPanel.scss'

type Props = {
    title?: React.ReactNode;
    showClose?: boolean;
    className?: string;
    onClose?(): void;
} & React.PropsWithChildren

export const SlidingPanelHeader: React.FC<Props> = ({
    title,
    showClose = true,
    className,
    children,
    onClose,
}) => (
    <div className={classNames('sliding-panel__header', className)}>
        <div className="sliding-panel__header-inner">
            {title && (
                <div className="sliding-panel__title">
                    {title}
                </div>
            )}
            {showClose && (
                <div className="sliding-panel__close">
                    <Button
                        size="s"
                        shape="icon"
                        design="transparency"
                        onClick={onClose}
                    >
                        <Icon icon="cross" width={16} height={16} />
                    </Button>
                </div>
            )}
        </div>
        {children}
    </div>
)
