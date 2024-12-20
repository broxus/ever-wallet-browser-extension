import * as React from 'react'

import './SlidingPanel.scss'
import { Button } from '@app/popup/modules/shared/components/Button'
import { Icon } from '@app/popup/modules/shared/components/Icon'

type Props = {
    title?: React.ReactNode;
    showClose?: boolean;
    onClose?(): void;
}

export const SlidingPanelHeader: React.FC<Props> = ({
    title,
    showClose = true,
    onClose,
}) => (
    <div className="sliding-panel__header">
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
)
