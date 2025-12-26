import * as React from 'react'
import { Popover } from 'react-tiny-popover'
import classNames from 'classnames'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button, Icon, useSlidingPanel, useViewModel } from '@app/popup/modules/shared'
import { Networks } from '@app/popup/modules/network'

import styles from './index.module.scss'
import { SettingsViewModel } from './SettingsViewModel'
import { LogOut } from './LogOut'
import { DApps } from './DApps'

export const Settings: React.FC = observer(() => {
    const intl = useIntl()
    const vm = useViewModel(SettingsViewModel)
    const [isOpen, setIsOpen] = React.useState(false)

    const panel = useSlidingPanel()

    const ref = React.useRef<HTMLDivElement | null>(null)

    const openLogOutPanel = () => {
        setIsOpen(false)
        panel.open({
            title: intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' }),
            render: () => <LogOut onClose={panel.close} />,
        })
    }

    const openDAppsPanel = () => {
        setIsOpen(false)
        panel.open({
            showClose: false,
            render: () => <DApps onClose={panel.close} />,
        })
    }

    const handleManageSeeds = () => {
        setIsOpen(false)
        vm.manageSeeds()
    }

    const handleBackup = () => {
        setIsOpen(false)
        vm.onBackup()
    }

    return (
        <div className={styles.root}>
            <div ref={ref}>
                <Popover
                    isOpen={isOpen}
                    positions={['bottom']}
                    align="center"
                    padding={8}
                    onClickOutside={() => {
                        setIsOpen(false)
                    }}
                    reposition={false}
                    containerStyle={{
                        zIndex: '1',
                    }}
                    parentElement={ref.current || undefined}
                    content={(
                        <div className={styles.content}>
                            <div className={styles.list}>
                                <button className={classNames(styles.item)} onClick={handleManageSeeds}>
                                    <Icon className={styles.icon} icon="keyRound" />
                                    {intl.formatMessage({ id: 'MANAGE_SEEDS' })}
                                </button>
                                <button className={classNames(styles.item)} onClick={handleBackup}>
                                    <Icon className={styles.icon} icon="database" />
                                    {intl.formatMessage({ id: 'BACKUP_SEEDS' })}
                                </button>
                                {vm.isTon && (
                                    <button className={classNames(styles.item)} onClick={openDAppsPanel}>
                                        <Icon className={styles.icon} icon="plus" />
                                        {intl.formatMessage({ id: 'CONNECTED_DAPPS' })}
                                    </button>
                                )}
                                <hr className={styles.line} />
                                <a
                                    className={classNames(styles.item)}
                                    href="https://docs.sparxwallet.com/"
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                >
                                    <Icon className={styles.icon} icon="messageCircle" />
                                    {intl.formatMessage({ id: 'FAQ' })}
                                </a>
                                <a
                                    className={classNames(styles.item)}
                                    href="mailto:hello@sparxwallet.com"
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                >
                                    <Icon className={styles.icon} icon="messageSquare" />
                                    {intl.formatMessage({ id: 'CHAT_WITH_TEAM' })}
                                </a>
                                <a
                                    className={classNames(styles.item)}
                                    href="https://l1.broxus.com/sparx/terms"
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                >
                                    <Icon className={styles.icon} icon="link" />
                                    {intl.formatMessage({ id: 'LEGAL' })}
                                </a>
                                <hr className={styles.line} />
                                <button className={classNames(styles.item, styles.logout)} onClick={openLogOutPanel}>
                                    <Icon className={styles.logoutIcon} icon="logout" />
                                    {intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' })}
                                </button>
                                <span className={classNames(styles.item, styles.version)}>
                                    {intl.formatMessage({ id: 'EXTENSION_VERSION' }, { value: vm.version })}
                                </span>
                            </div>
                        </div>
                    )}
                >
                    <Button
                        size="s"
                        shape="icon"
                        design="transparency"
                        onClick={() => setIsOpen((p) => !p)}
                    >
                        <Icon icon="settings" width={16} height={16} />
                    </Button>
                </Popover>
            </div>

            <Networks onSettings={vm.openNetworkSettings} />
        </div>
    )
})
