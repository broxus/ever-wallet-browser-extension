import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import type { ConnectionDataItem } from '@app/models'
import { Icon, Loader, useSlidingPanel, useViewModel } from '@app/popup/modules/shared'
import { Icons } from '@app/popup/icons'

import { SelectNetwork } from '../SelectNetwork'
import { NetworksViewModel } from './NetworksViewModel'

import './Networks.scss'

interface Props {
    onSettings(): void;
}

export const Networks = observer(({ onSettings }: Props): JSX.Element => {
    const vm = useViewModel(NetworksViewModel)
    const intl = useIntl()
    const panel = useSlidingPanel()

    const handleSettings = useCallback(() => {
        panel.close()
        onSettings()
    }, [onSettings])
    const handleSelectNetwork = useCallback((item: ConnectionDataItem) => {
        panel.close()
        vm.changeNetwork(item)
    }, [onSettings])
    const handleBtnClick = useCallback(() => {
        panel.open({
            whiteBg: true,
            render: () => (
                <SelectNetwork
                    networks={vm.networks}
                    selectedConnectionId={vm.selectedConnection.connectionId}
                    onSelectNetwork={handleSelectNetwork}
                    onSettings={handleSettings}
                />
            ),
        })
    }, [onSettings])

    return (
        <div className="networks">
            <Icon icon="logoCircle" className="networks__logo" />
            <div className="networks__network">
                <div className="networks__network-title">
                    {intl.formatMessage({ id: 'NETWORK_BTN_TITLE' })}
                </div>
                <button type="button" className="networks__network-btn" onClick={handleBtnClick}>
                    <span title={vm.networkTitle}>{vm.networkTitle}</span>
                    {Icons.chevronDown}
                </button>
            </div>

            {(vm.loading || vm.pendingConnection) && (
                <div className="networks__loader">
                    <Loader />
                </div>
            )}
        </div>
    )
})
