import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'

import { Icons } from '@app/popup/icons'
import { Card, Container, Content, Header, Icon, Navbar, RoundedIcon, useConfirmation, useViewModel } from '@app/popup/modules/shared'

import { LanguageSelector } from '../LanguageSelector'
import { SettingsViewModel } from './SettingsViewModel'
import styles from './Settings.module.scss'

export const Settings = observer((): JSX.Element | null => {
    const vm = useViewModel(SettingsViewModel)
    const intl = useIntl()
    const confirmation = useConfirmation()

    const handleLanguage = useCallback(() => vm.panel.open({
        whiteBg: true,
        fullHeight: true,
        render: () => <LanguageSelector />,
    }), [])

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
                <Navbar back="/profile">
                    {intl.formatMessage({ id: 'SETTINGS_BTN_TEXT' })}
                </Navbar>
            </Header>

            <Content className={styles.content}>
                <Card>
                    <button type="button" className={styles.item} onClick={handleLanguage}>
                        <RoundedIcon icon={Icons.planet} />
                        {intl.formatMessage({ id: 'LANGUAGE' })}
                        <Icon icon="chevronRight" className={styles.arrow} />
                    </button>
                </Card>

                <div className={styles.bottom}>
                    <Card>
                        <button type="button" className={styles.logout} onClick={handleLogout}>
                            {intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' })}
                            {Icons.logout}
                        </button>
                    </Card>
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
