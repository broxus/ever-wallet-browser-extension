import Profile from '@app/popup/assets/img/profile.svg';
import { Dropdown, useDrawerPanel, useOnClickOutside, useResolve } from '@app/popup/modules/shared';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { AccountSettingsViewModel } from './AccountSettingsViewModel';

import './AccountSettings.scss';

export const AccountSettings = observer((): JSX.Element => {
  const vm = useResolve(AccountSettingsViewModel);
  const intl = useIntl();

  vm.drawer = useDrawerPanel(); // TODO: drawer refactor

  const btnRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  useOnClickOutside(dropdownRef, btnRef, vm.hideDropdown);

  return (
    <div className="account-settings">
      <button type="button" className="account-settings__profile-btn" ref={btnRef} onClick={vm.toggleDropdown}>
        <img src={Profile} alt="" />
      </button>

      <Dropdown className="account-settings__dropdown" ref={dropdownRef} active={vm.dropdownActive}>
        <div className="account-settings__section">
          <div className="account-settings__lang-switcher">
            <button
              type="button"
              className={classNames('account-settings__lang-switcher-btn', { _active: vm.selectedLocale === 'en' })}
              onClick={vm.setEnglishLocale}
            >
              English
            </button>
            <button
              type="button"
              className={classNames('account-settings__lang-switcher-btn', { _active: vm.selectedLocale === 'ko' })}
              onClick={vm.setKoreanLocale}
            >
              한국어
            </button>
          </div>
        </div>

        <hr className="account-settings__separator" />

        <div className="account-settings__section">
          <div className="account-settings__section-header">
            {intl.formatMessage(
              { id: 'ACCOUNT_CURRENT_ACCOUNT_PLACEHOLDER' },
              {
                name: vm.selectedSeedName,
              },
            )}
          </div>
        </div>

        <hr className="account-settings__separator" />

        <div className="account-settings__section">
          <div className="account-settings__section-header">
            {intl.formatMessage({
              id: 'ACCOUNT_RECENT_SEEDS_HEADER',
            })}
          </div>

          <ul className="account-settings__seeds-list">
            {vm.recentMasterKeys.map(({ key, name }) => (
              <li key={key.masterKey}>
                <button
                  type="button"
                  className="account-settings__seeds-list-item"
                  onClick={() => vm.selectMasterKey(key.masterKey)}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>

          <div className="account-settings__section-item" onClick={vm.manageSeeds}>
            {intl.formatMessage({
              id: 'ACCOUNT_MANAGE_SEED_AND_ACCOUNT_LINK_TEXT',
            })}
          </div>
        </div>

        <hr className="account-settings__separator" />

        <button
          className="account-settings__logout-btn"
          onClick={vm.logOut}
        >
          {intl.formatMessage({
            id: 'ACCOUNT_LOGOUT_LINK_TEXT',
          })}
        </button>
        <div className="account-settings__version">
          {intl.formatMessage(
            { id: 'EXTENSION_VERSION' },
            { value: vm.version },
          )}
        </div>
      </Dropdown>
    </div>
  );
});
