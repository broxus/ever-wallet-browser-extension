import { Popover } from 'react-tiny-popover'
import { PropsWithChildren, ReactElement, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import { closeCurrentWindow } from '@app/shared'
import { Button } from '@app/popup/modules/shared/components/Button'
import { Icon } from '@app/popup/modules/shared/components/Icon'

import styles from './Navbar.module.scss'


interface Props extends PropsWithChildren {
    back?: string | (() => void);
    close?: 'window' | string | (() => void);
    settings?: ReactElement;
    info?: ReactElement;
}

export const Navbar = observer((props: Props): JSX.Element => {
    const {
        back,
        close,
        children,
        settings,
        info,
    } = props
    const navigate = typeof back === 'string' || (typeof close === 'string' && close !== 'window')
        ? useNavigate()
        : null
    const [isOpen, setIsOpen] = useState(false)

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

    useEffect(() => {
        const onMenuClick = () => setIsOpen(false)
        window.addEventListener('menu.click', onMenuClick)
        return () => window.removeEventListener('menu.click', onMenuClick)
    }, [])

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
                {info}
                {settings && (
                    <Popover
                        isOpen={isOpen}
                        positions={['bottom']}
                        align="end"
                        padding={8}
                        onClickOutside={() => {
                            setIsOpen(false)
                        }}
                        reposition={false}
                        containerStyle={{
                            zIndex: '1',
                        }}
                        content={settings as ReactElement}
                    >
                        <Button
                            size="s"
                            shape="icon"
                            design="transparency"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <Icon icon="settings" width={16} height={16} />
                        </Button>
                    </Popover>
                )}
            </div>
        </div>
    )
})
