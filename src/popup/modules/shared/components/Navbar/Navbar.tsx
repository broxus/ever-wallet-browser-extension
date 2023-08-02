import { memo, PropsWithChildren } from 'react'
import { useNavigate } from 'react-router'

import { closeCurrentWindow } from '@app/shared'
import SettingsIcon from '@app/popup/assets/icons/settings.svg'
import ArrowLeftIcon from '@app/popup/assets/icons/arrow-left.svg'
import CloseIcon from '@app/popup/assets/icons/cross.svg'

import { IconButton } from '../IconButton'
import styles from './Navbar.module.scss'

interface Props extends PropsWithChildren {
    back?: string | (() => void);
    close?: 'window' | string | (() => void);
    onSettings?(): void;
}

const settingsIcon = <SettingsIcon />
const arrowIcon = <ArrowLeftIcon />
const closeIcon = <CloseIcon />

export const Navbar = memo((props: Props): JSX.Element => {
    const {
        back,
        close,
        children,
        onSettings,
    } = props
    const navigate = useNavigate()

    const handleBack = () => {
        if (typeof back === 'string') {
            navigate(back)
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
            navigate(close)
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
                        size="m"
                        icon={arrowIcon}
                        onClick={handleBack}
                    />
                )}
            </div>
            {children && (
                <div className={styles.middle}>{children}</div>
            )}
            <div className={styles.right}>
                {onSettings && (
                    <IconButton
                        design="secondary"
                        size="m"
                        icon={settingsIcon}
                        onClick={onSettings}
                    />
                )}
                {close && (
                    <IconButton
                        design="secondary"
                        size="m"
                        icon={closeIcon}
                        onClick={handleClose}
                    />
                )}
            </div>
        </div>
    )
})
