import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'
import { Container, Content, Header, Navbar, useViewModel } from '@app/popup/modules/shared'
import { NavMenu } from '@app/popup/modules/shared/components/NavMenu'

import { ProfileViewModel } from './ProfileViewModel'
import styles from './Profile.module.scss'

export const Profile = observer((): JSX.Element | null => {
    const vm = useViewModel(ProfileViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Header>
                <Navbar close="/">
                    {vm.selectedMasterKey && (
                        <div className={styles.currentSeed}>
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
                <NavMenu
                    items={[
                        ...(vm.recentMasterKeys.map(item => ({
                            text: vm.masterKeysNames[item.masterKey] || convertAddress(item.masterKey),
                            onClick: () => vm.selectMasterKey(item.masterKey),
                        }))),
                        ...[{
                            text: intl.formatMessage({ id: 'ACCOUNT_MANAGE_SEED_AND_ACCOUNT_LINK_TEXT' }),
                            arrow: true,
                            icon: Icons.seed,
                            onClick: vm.manageSeeds,
                        }, {
                            text: intl.formatMessage({ id: 'CONTACT_CONTACTS' }),
                            arrow: true,
                            icon: Icons.person,
                            onClick: vm.openContacts,
                        }, {
                            text: intl.formatMessage({ id: 'SETTINGS_BTN_TEXT' }),
                            arrow: true,
                            icon: Icons.settings,
                            onClick: vm.openSettings,
                        }],
                    ]}
                />
            </Content>
        </Container>
    )
})
