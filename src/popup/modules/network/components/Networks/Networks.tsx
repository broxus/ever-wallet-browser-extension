import { observer } from 'mobx-react-lite'
import { useState, useRef } from 'react'
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
    const ref = useRef<HTMLDivElement | null>(null)

    return (
        <div ref={ref}>
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
                parentElement={ref.current || undefined}
                content={(
                    <div className={styles.netTooltip}>
                        {vm.networks.length > 0 && (
                            <div className={styles.list}>
                                {vm.networks.map(network => (
                                    <button
                                        key={network.connectionId}
                                        className={styles.item}
                                        onClick={() => {
                                            setIsOpen(false)
                                            vm.changeNetwork(network)
                                        }}
                                    >
                                        <div className={styles.inner}>
                                            <NetworkIcon
                                                className={styles.netIcon}
                                                connectionId={network.connectionId}
                                            />
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
                        <NetworkIcon className={styles.netIcon} connectionId={vm.selectedConnection.connectionId} />
                        <Icon icon="chevronDown" />
                    </div>
                </Button>
            </Popover>
        </div>

    )
})
