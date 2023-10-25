import { PropsWithChildren, ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import { closeCurrentWindow } from '@app/shared'
import { Icons } from '@app/popup/icons'

import { useResolve } from '../../hooks'
import { SlidingPanelStore } from '../../store'
import { IconButton } from '../IconButton'
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
                    <IconButton
                        design="secondary"
                        size="s"
                        icon={Icons.arrowLeft}
                        onClick={handleBack}
                    />
                )}
                {close && (
                    <IconButton
                        design="secondary"
                        size="s"
                        icon={Icons.cross}
                        onClick={handleClose}
                    />
                )}
            </div>
            {children && (
                <div className={styles.middle}>{children}</div>
            )}
            <div className={styles.right}>
                {settings && (
                    <IconButton
                        design="secondary"
                        size="s"
                        icon={Icons.settings}
                        onClick={handleSettings}
                    />
                )}
            </div>
        </div>
    )
})
