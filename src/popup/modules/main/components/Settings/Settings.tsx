import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'
import { Button, Container, Content, Header, Icon, Navbar, RoundedIcon, useConfirmation, useViewModel } from '@app/popup/modules/shared'

import { SettingsViewModel } from './SettingsViewModel'
import styles from './Settings.module.scss'

export const Settings = observer((): JSX.Element | null => {
    const vm = useViewModel(SettingsViewModel)
    const intl = useIntl()
    const confirmation = useConfirmation()

    const handleLogout = useCallback(async () => {
        const confirmed = await confirmation.show({
            title: intl.formatMessage({ id: 'LOGOUT_CONFIRMATION_TITLE' }),
            body: intl.formatMessage({ id: 'LOGOUT_CONFIRMATION_TEXT' }),
            confirmBtnText: intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' }),
        })
        if (confirmed) {
            await vm.logOut()
        }
    }, [])

    return (
        <Container>
            <Header>
                <Navbar back="/">
                    {vm.selectedMasterKey && (
                        <div className={styles.seed}>
                            <div className={styles.label}>
                                {intl.formatMessage({ id: 'CURRENT_SEED_HINT' })}
                            </div>
                            <div className={styles.name}>
                                {vm.masterKeysNames[vm.selectedMasterKey] || convertAddress(vm.selectedMasterKey)}
                            </div>
                        </div>
                    )}
                </Navbar>
            </Header>

            <Content className={styles.content}>
                <div className={styles.pane}>
                    {!!vm.recentMasterKeys.length && (
                        <div className={styles.recent}>
                            <div className={styles.label}>History</div>
                            {vm.recentMasterKeys.map(({ masterKey }) => (
                                <button
                                    type="button"
                                    key={masterKey}
                                    className={styles.item}
                                    onClick={() => vm.selectMasterKey(masterKey)}
                                >
                                    <RoundedIcon icon={Icons.logo} />
                                    <div>
                                        <div className={styles.seedName} title={masterKey}>
                                            {vm.masterKeysNames[masterKey] || convertAddress(masterKey)}
                                        </div>
                                        <div className={styles.seedInfo}>
                                            {intl.formatMessage(
                                                { id: 'PUBLIC_KEYS_PLURAL' },
                                                { count: vm.keysByMasterKey[masterKey]?.length ?? 0 },
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <button type="button" className={styles.item} onClick={vm.manageSeeds}>
                        <RoundedIcon icon={Icons.settings} />
                        {intl.formatMessage({ id: 'ACCOUNT_MANAGE_SEED_AND_ACCOUNT_LINK_TEXT' })}
                        <Icon icon="chevronRight" className={styles.arrow} />
                    </button>

                    <Link to="/settings/language" className={styles.item}>
                        <RoundedIcon icon={Icons.planet} />
                        {intl.formatMessage({ id: 'LANGUAGE' })}
                        <Icon icon="chevronRight" className={styles.arrow} />
                    </Link>

                    <button type="button" className={styles.item} onClick={vm.openContacts}>
                        <RoundedIcon icon={Icons.person} />
                        {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                        <Icon icon="chevronRight" className={styles.arrow} />
                    </button>
                </div>

                <div className={styles.bottom}>
                    <Button design="alert" onClick={handleLogout}>
                        {intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' })}
                        {Icons.logout}
                    </Button>
                    <div className={styles.version}>
                        {intl.formatMessage(
                            { id: 'EXTENSION_VERSION' },
                            { value: vm.version },
                        )}
                    </div>
                </div>
            </Content>
        </Container>
    )
})
