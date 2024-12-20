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

export const Settings: React.FC = observer(() => {
    const intl = useIntl()
    const vm = useViewModel(SettingsViewModel)
    const [isOpen, setIsOpen] = React.useState(false)

    const panel = useSlidingPanel()

    const openLogOutPanel = () => {
        setIsOpen(false)
        panel.open({
            title: intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' }),
            render: () => <LogOut onClose={panel.close} />,
        })
    }

    return (
        <div className={styles.root}>
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
                content={(
                    <div className={styles.content}>
                        <div className={styles.list}>
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
                    size="s" shape="icon" design="transparency"
                    onClick={() => setIsOpen((p) => !p)}
                >
                    <Icon icon="settings" width={16} height={16} />
                </Button>
            </Popover>

            <Networks onSettings={vm.openNetworkSettings} />
        </div>
    )
})
