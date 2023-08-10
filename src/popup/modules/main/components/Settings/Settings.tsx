import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'
import { Button, Container, Content, Header, Navbar, RoundedIcon, useConfirmation, useViewModel } from '@app/popup/modules/shared'
import { ExportSeed } from '@app/popup/modules/account'

import { SettingsViewModel } from './SettingsViewModel'
import styles from './Settings.module.scss'

export const Settings = observer((): JSX.Element | null => {
    const vm = useViewModel(SettingsViewModel)
    const intl = useIntl()
    const confirmation = useConfirmation()

    const handleExport = () => useCallback(() => {
        vm.panel.open({
            fullHeight: true,
            showClose: false,
            render: () => <ExportSeed keyEntry={vm.masterKey!} />,
        })
    }, [])
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
                <Navbar back="/" />
            </Header>

            <Content className={styles.content}>
                {vm.selectedMasterKey && (
                    <div className={styles.seed}>
                        <div className={styles.label}>
                            {intl.formatMessage({ id: 'CURRENT_SEED_HINT' })}
                        </div>
                        <div className={styles.name}>
                            {vm.masterKeysNames[vm.selectedMasterKey] || convertAddress(vm.selectedMasterKey)}
                        </div>
                        <Button design="secondary" className={styles.export} onClick={handleExport}>
                            {intl.formatMessage({ id: 'EXPORT_SEED_BTN_TEXT' })}
                            {Icons.external}
                        </Button>
                    </div>
                )}

                <div className={styles.pane}>
                    <button type="button" className={styles.item} onClick={vm.manageSeeds}>
                        <RoundedIcon className={styles.icon} icon={Icons.settings} />
                        {intl.formatMessage({ id: 'ACCOUNT_MANAGE_SEED_AND_ACCOUNT_LINK_TEXT' })}
                        <Icons.ChevronRight className={styles.arrow} />
                    </button>

                    <Link to="/settings/language" className={styles.item}>
                        <RoundedIcon className={styles.icon} icon={Icons.planet} />
                        {intl.formatMessage({ id: 'LANGUAGE' })}
                        <Icons.ChevronRight className={styles.arrow} />
                    </Link>

                    <button type="button" className={styles.item} onClick={vm.openContacts}>
                        <RoundedIcon className={styles.icon} icon={Icons.person} />
                        {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                        <Icons.ChevronRight className={styles.arrow} />
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
