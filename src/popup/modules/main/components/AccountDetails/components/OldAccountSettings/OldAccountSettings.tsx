import { observer } from 'mobx-react-lite'
import { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'

import { Dropdown, IconButton, useConfirmation, useOnClickOutside, useViewModel } from '@app/popup/modules/shared'
import { convertAddress } from '@app/shared'
import ProfileIcon from '@app/popup/assets/icons/profile.svg'
import KeyIcon from '@app/popup/assets/icons/key.svg'
import ChevronIcon from '@app/popup/assets/icons/chevron-right.svg'
import LogoutIcon from '@app/popup/assets/icons/logout.svg'
import ProfileSrc from '@app/popup/assets/img/profile.svg'
import SeedSrc from '@app/popup/assets/img/seed.svg'
import PersonIcon from '@app/popup/assets/icons/person.svg'

import { LanguageFlag } from '../../../LanguageFlag'
import { OldAccountSettingsViewModel } from './OldAccountSettingsViewModel'

import './OldAccountSettings.scss'

export const OldAccountSettings = observer((): JSX.Element => {
    const vm = useViewModel(OldAccountSettingsViewModel)
    const confirmation = useConfirmation()
    const intl = useIntl()

    const handleLogout = useCallback(async () => {
        vm.hideDropdown()
        const confirmed = await confirmation.show({
            title: intl.formatMessage({ id: 'LOGOUT_CONFIRMATION_TITLE' }),
            body: intl.formatMessage({ id: 'LOGOUT_CONFIRMATION_TEXT' }),
            confirmBtnText: intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' }),
        })
        if (confirmed) {
            await vm.logOut()
        }
    }, [])

    const btnRef = useRef(null)
    const dropdownRef = useRef(null)

    useOnClickOutside(dropdownRef, btnRef, vm.hideDropdown)

    return (
        <div className="old-account-settings">
            <IconButton
                size="m"
                design="secondary"
                ref={btnRef}
                icon={<PersonIcon />}
                onClick={vm.toggleDropdown}
            />

            <Dropdown className="old-account-settings__dropdown" ref={dropdownRef} active={vm.dropdownActive}>
                <div className="old-account-settings__section">
                    {vm.selectedMasterKey && (
                        <div className="old-account-settings__seed">
                            <img className="old-account-settings__seed-img" src={SeedSrc} alt="" />
                            <div className="old-account-settings__seed-wrap">
                                <div className="old-account-settings__seed-name" title={vm.selectedMasterKey}>
                                    {vm.masterKeysNames[vm.selectedMasterKey] || convertAddress(vm.selectedMasterKey)}
                                </div>
                                <div className="old-account-settings__seed-surrent">
                                    {intl.formatMessage({ id: 'ACCOUNT_CURRENT_ACCOUNT_MARK' })}
                                </div>
                            </div>
                        </div>
                    )}

                    {!!vm.recentMasterKeys.length && (
                        <div className="seeds-list">
                            {vm.recentMasterKeys.map(({ masterKey }) => (
                                <button
                                    type="button"
                                    className="seeds-list__item"
                                    key={masterKey}
                                    onClick={() => vm.selectMasterKey(masterKey)}
                                >
                                    <img className="seeds-list__item-img" src={SeedSrc} alt="" />
                                    <span className="seeds-list__item-name" title={masterKey}>
                                        {vm.masterKeysNames[masterKey] || convertAddress(masterKey)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    <button type="button" className="old-account-settings__btn" onClick={vm.manageSeeds}>
                        <KeyIcon className="old-account-settings__btn-icon" />
                        <span className="old-account-settings__btn-text">
                            {intl.formatMessage({ id: 'ACCOUNT_MANAGE_SEED_AND_ACCOUNT_LINK_TEXT' })}
                        </span>
                        <ChevronIcon className="old-account-settings__btn-icon _arrow" />
                    </button>
                </div>

                <div className="old-account-settings__section">
                    <button type="button" className="old-account-settings__btn" onClick={vm.openContacts}>
                        <ProfileIcon className="old-account-settings__btn-icon" />
                        <span className="old-account-settings__btn-text">
                            {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                        </span>
                        <ChevronIcon className="old-account-settings__btn-icon _arrow" />
                    </button>

                    <button type="button" className="old-account-settings__btn" onClick={vm.openLanguage}>
                        <LanguageFlag className="old-account-settings__btn-icon" lang={vm.selectedLocale} />
                        <span className="old-account-settings__btn-text">
                            {intl.formatMessage({ id: 'LANGUAGE' })}
                        </span>
                        <ChevronIcon className="old-account-settings__btn-icon _arrow" />
                    </button>

                    <button type="button" className="old-account-settings__btn _logout" onClick={handleLogout}>
                        <LogoutIcon className="old-account-settings__btn-icon" />
                        <span className="old-account-settings__btn-text">
                            {intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' })}
                        </span>
                    </button>
                </div>

                <div className="old-account-settings__version">
                    {intl.formatMessage(
                        { id: 'EXTENSION_VERSION' },
                        { value: vm.version },
                    )}
                </div>
            </Dropdown>
        </div>
    )
})
