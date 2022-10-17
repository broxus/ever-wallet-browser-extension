import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'

import {
    Dropdown, Loader, useOnClickOutside, useViewModel,
} from '@app/popup/modules/shared'

import { NetworkSettingsViewModel } from './NetworkSettingsViewModel'

import './NetworkSettings.scss'

export const NetworkSettings = observer((): JSX.Element => {
    const vm = useViewModel(NetworkSettingsViewModel)
    const intl = useIntl()

    const btnRef = useRef(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        vm.getAvailableNetworks()
    }, [])

    useOnClickOutside(dropdownRef, btnRef, vm.hideDropdown)

    return (
        <div className="network-settings">
            <button
                type="button"
                className="network-settings__network-btn"
                onClick={vm.toggleDropdown}
                ref={btnRef}
            >
                {vm.networkTitle}
            </button>

            <Dropdown className="network-settings__dropdown" ref={dropdownRef} active={vm.dropdownActive}>
                <div className="network-settings__dropdown-header">
                    {intl.formatMessage({
                        id: 'NETWORK_TOGGLE_HEADER',
                    })}
                </div>
                <ul className="network-settings__networks-list">
                    {vm.networks.map(network => {
                        const className = classNames('network-settings__networks-list-item', {
                            _active: network.connectionId === vm.selectedConnection.connectionId,
                        })

                        const onClick = () => vm.changeNetwork(network)

                        return (
                            <li key={network.connectionId}>
                                <button type="button" className={className} onClick={onClick}>
                                    {network.name}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </Dropdown>

            {(vm.loading || vm.pendingConnection) && (
                <div className="network-settings__loader">
                    <Loader />
                </div>
            )}
        </div>
    )
})
