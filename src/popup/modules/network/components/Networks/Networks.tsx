import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    Dropdown,
    Loader,
    useOnClickOutside,
    useViewModel,
} from '@app/popup/modules/shared'
import CheckIcon from '@app/popup/assets/icons/check.svg'

import { NetworksViewModel } from './NetworksViewModel'

import './Networks.scss'

interface Props {
    onSettings(): void;
}

export const Networks = observer(({ onSettings }: Props): JSX.Element => {
    const vm = useViewModel(NetworksViewModel)
    const intl = useIntl()

    const handleSettingsClick = useCallback(() => {
        vm.hideDropdown()
        onSettings()
    }, [onSettings])

    const btnRef = useRef(null)
    const dropdownRef = useRef(null)

    useOnClickOutside(dropdownRef, btnRef, vm.hideDropdown)

    return (
        <div className="networks">
            <button
                type="button"
                className="networks__network-btn"
                onClick={vm.toggleDropdown}
                ref={btnRef}
            >
                {vm.networkTitle}
            </button>

            <Dropdown className="networks__dropdown" ref={dropdownRef} active={vm.dropdownActive}>
                <div className="networks__dropdown-header">
                    {intl.formatMessage({
                        id: 'NETWORK_HEADER',
                    })}
                </div>
                <ul className="networks-list">
                    {vm.networks.map(network => {
                        const active = network.connectionId === vm.selectedConnection.connectionId
                        const className = classNames('networks-list__item', {
                            _active: active,
                        })

                        const onClick = () => vm.changeNetwork(network)

                        return (
                            <li key={network.connectionId} className={className}>
                                <button
                                    type="button"
                                    className="networks-list__item-btn"
                                    title={network.name}
                                    onClick={onClick}
                                >
                                    {network.name}
                                </button>
                                {active && <CheckIcon className="networks-list__item-icon" />}
                            </li>
                        )
                    })}
                </ul>
                <Button design="secondary" className="networks__dropdown-btn" onClick={handleSettingsClick}>
                    {intl.formatMessage({
                        id: 'NETWORK_DROPDOWN_BTN_TEXT',
                    })}
                </Button>
            </Dropdown>

            {(vm.loading || vm.pendingConnection) && (
                <div className="networks__loader">
                    <Loader />
                </div>
            )}
        </div>
    )
})
