import { Dropdown, useOnClickOutside, useResolve } from '@app/popup/modules/shared';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { NetworkSettingsViewModel } from './NetworkSettingsViewModel';

import './NetworkSettings.scss';

export const NetworkSettings = observer((): JSX.Element => {
  const vm = useResolve(NetworkSettingsViewModel);
  const intl = useIntl();

  const btnRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    vm.getAvailableNetworks();
  }, []);

  useOnClickOutside(dropdownRef, btnRef, vm.hideDropdown);

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
          {vm.networks.map((network) => {
            const className = classNames('network-settings__networks-list-item', {
              _active: network.id === vm.selectedConnection.id,
            });

            const onClick = () => vm.changeNetwork(network);

            return (
              <li key={network.id}>
                <button type="button" className={className} onClick={onClick}>
                  {network.name}
                </button>
              </li>
            );
          })}
        </ul>
      </Dropdown>
    </div>
  );
});
