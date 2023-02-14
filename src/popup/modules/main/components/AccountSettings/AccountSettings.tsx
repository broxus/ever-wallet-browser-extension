import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { useIntl } from 'react-intl'

import { Dropdown, RadioButton, useOnClickOutside, useViewModel } from '@app/popup/modules/shared'
import { convertAddress } from '@app/shared'
import ProfileIcon from '@app/popup/assets/icons/profile.svg'
import KeyIcon from '@app/popup/assets/icons/key.svg'
import ArrowIcon from '@app/popup/assets/icons/arrow-right.svg'
import LogoutIcon from '@app/popup/assets/icons/logout.svg'
import Profile from '@app/popup/assets/img/profile.svg'

import { LanguageFlag } from '../LanguageFlag'
import { AccountSettingsViewModel } from './AccountSettingsViewModel'

import './AccountSettings.scss'

export const AccountSettings = observer((): JSX.Element => {
    const vm = useViewModel(AccountSettingsViewModel)
    const intl = useIntl()

    const btnRef = useRef(null)
    const dropdownRef = useRef(null)

    useOnClickOutside(dropdownRef, btnRef, vm.hideDropdown)

    return (
        <div className="account-settings">
            <button
                type="button"
                className="account-settings__profile-btn"
                ref={btnRef}
                onClick={vm.toggleDropdown}
            >
                <img src={Profile} alt="" />
            </button>

            <Dropdown className="account-settings__dropdown" ref={dropdownRef} active={vm.dropdownActive}>
                <div className="account-settings__section">
                    <div className="account-settings__section-header">
                        {intl.formatMessage({ id: 'ACCOUNT_RECENT_SEEDS_HEADER' })}
                    </div>

                    {!!vm.recentMasterKeys.length && (
                        <ul className="seeds-list">
                            {vm.recentMasterKeys.map(({ masterKey }) => (
                                <li className="seeds-list__item" key={masterKey}>
                                    <RadioButton
                                        className="seeds-list__item-radio"
                                        id={masterKey}
                                        value={masterKey}
                                        checked={vm.selectedMasterKey === masterKey}
                                        onChange={vm.selectMasterKey}
                                    >
                                        {vm.masterKeysNames[masterKey] || convertAddress(masterKey)}
                                        {vm.selectedMasterKey === masterKey && (
                                            <span className="seeds-list__item-mark">
                                                ({intl.formatMessage({ id: 'ACCOUNT_CURRENT_ACCOUNT_MARK' })})
                                            </span>
                                        )}
                                    </RadioButton>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button type="button" className="account-settings__btn" onClick={vm.manageSeeds}>
                        <KeyIcon className="account-settings__btn-icon" />
                        <span className="account-settings__btn-text">
                            {intl.formatMessage({ id: 'ACCOUNT_MANAGE_SEED_AND_ACCOUNT_LINK_TEXT' })}
                        </span>
                        <ArrowIcon className="account-settings__btn-icon _arrow" />
                    </button>
                </div>

                <div className="account-settings__section">
                    <div className="account-settings__section-header">
                        {intl.formatMessage({ id: 'ACCOUNT_PROFILE_HEADER' })}
                    </div>

                    <button type="button" className="account-settings__btn" onClick={vm.openContacts}>
                        <ProfileIcon className="account-settings__btn-icon" />
                        <span className="account-settings__btn-text">
                            {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                        </span>
                        <ArrowIcon className="account-settings__btn-icon _arrow" />
                    </button>

                    <button type="button" className="account-settings__btn" onClick={vm.openLanguage}>
                        <LanguageFlag className="account-settings__btn-icon" lang={vm.selectedLocale} />
                        <span className="account-settings__btn-text">
                            {intl.formatMessage({ id: 'LANGUAGE' })}
                        </span>
                        <ArrowIcon className="account-settings__btn-icon _arrow" />
                    </button>

                    <button type="button" className="account-settings__btn _logout" onClick={vm.logOut}>
                        <LogoutIcon className="account-settings__btn-icon" />
                        <span className="account-settings__btn-text">
                            {intl.formatMessage({ id: 'ACCOUNT_LOGOUT_LINK_TEXT' })}
                        </span>
                    </button>
                </div>

                <div className="account-settings__version">
                    {intl.formatMessage(
                        { id: 'EXTENSION_VERSION' },
                        { value: vm.version },
                    )}
                </div>
            </Dropdown>
        </div>
    )
})
