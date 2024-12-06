import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Popover } from 'react-tiny-popover'

import { Button, Icon, useViewModel } from '@app/popup/modules/shared'
import { NetworkIcon } from '@app/popup/modules/network/components/NetworkIcon/NetworkIcon'

import { NetworksViewModel } from './NetworksViewModel'
import styles from './Networks.module.scss'

import './Networks.scss'

type Props = {
    onSettings: () => void
}

export const Networks = observer(({ onSettings }: Props): JSX.Element => {
    const vm = useViewModel(NetworksViewModel)
    const intl = useIntl()
    const [isOpen, setIsOpen] = useState(false)

    return (
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
            content={(
                <div className={styles.netTooltip}>
                    {vm.networks.length > 0 && (
                        <div className={styles.list}>
                            {vm.networks.map(network => (
                                <button
                                    className={styles.item}
                                    onClick={() => {
                                        setIsOpen(false)
                                        vm.changeNetwork(network)
                                    }}
                                >
                                    <div className={styles.inner}>
                                        <NetworkIcon className={styles.netIcon} network={network} />
                                        {network.name}
                                    </div>
                                    {vm.selectedConnection.connectionId === network.connectionId && (
                                        <Icon icon="check" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className={styles.btn}>
                        <Button
                            size="s"
                            design="transparency"
                            onClick={() => {
                                setIsOpen(false)
                                onSettings()
                            }}
                        >
                            {intl.formatMessage({
                                id: 'NETWORK_DROPDOWN_BTN_TEXT',
                            })}
                        </Button>
                    </div>
                </div>
            )}
        >
            <Button
                size="s"
                shape="icon"
                design="transparency"
                onClick={() => setIsOpen(!isOpen)}
                disabled={!!vm.loading || !!vm.pendingConnection}
            >
                <div className={styles.netSelect}>
                    <NetworkIcon className={styles.netIcon} network={vm.selectedConnection} />
                    <Icon icon="chevronDown" />
                </div>
            </Button>
        </Popover>
    )
})
