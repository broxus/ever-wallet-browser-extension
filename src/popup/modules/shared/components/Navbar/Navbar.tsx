import { PropsWithChildren, ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import { closeCurrentWindow } from '@app/shared'
import { Button } from '@app/popup/modules/shared/components/Button'
import { Icon } from '@app/popup/modules/shared/components/Icon'

import { useResolve } from '../../hooks'
import { SlidingPanelStore } from '../../store'
import styles from './Navbar.module.scss'


interface Props extends PropsWithChildren {
    back?: string | (() => void);
    close?: 'window' | string | (() => void);
    settings?: ReactNode;
}

export const Navbar = observer((props: Props): JSX.Element => {
    const {
        back,
        close,
        children,
        settings,
    } = props
    const navigate = typeof back === 'string' || (typeof close === 'string' && close !== 'window')
        ? useNavigate()
        : null
    const store = useResolve(SlidingPanelStore)

    const handleSettings = () => store.open({ render: () => settings })

    const handleBack = () => {
        if (typeof back === 'string') {
            navigate?.(back)
        }
        else {
            back?.()
        }
    }
    const handleClose = () => {
        if (close === 'window') {
            closeCurrentWindow()
        }
        else if (typeof close === 'string') {
            navigate?.(close)
        }
        else {
            close?.()
        }
    }

    return (
        <div className={styles.navbar}>
            <div className={styles.left}>
                {back && (
                    <Button
                        size="s"
                        shape="icon"
                        design="transparency"
                        onClick={handleBack}
                    >
                        <Icon icon="arrowLeft" width={16} height={16} />
                    </Button>
                )}
                {close && (
                    <Button
                        size="s"
                        shape="icon"
                        design="transparency"
                        onClick={handleClose}
                    >
                        <Icon icon="cross" width={16} height={16} />
                    </Button>
                )}
            </div>
            {children && (
                <div className={styles.middle}>{children}</div>
            )}
            <div className={styles.right}>
                {settings && (
                    <Button
                        size="s"
                        shape="icon"
                        design="transparency"
                        onClick={handleSettings}
                    >
                        <Icon icon="settings" width={16} height={16} />
                    </Button>
                )}
            </div>
        </div>
    )
})
