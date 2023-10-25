import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'
import { Card, Container, Content, Header, Icon, Navbar, RoundedIcon, useViewModel } from '@app/popup/modules/shared'

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
                <Card>
                    {!!vm.recentMasterKeys.length && (
                        <div>
                            {vm.recentMasterKeys.map(({ masterKey }) => (
                                <button
                                    type="button"
                                    key={masterKey}
                                    className={styles.seed}
                                    title={masterKey}
                                    onClick={() => vm.selectMasterKey(masterKey)}
                                >
                                    {vm.masterKeysNames[masterKey] || convertAddress(masterKey)}
                                </button>
                            ))}
                        </div>
                    )}
                    <button type="button" className={styles.item} onClick={vm.manageSeeds}>
                        <RoundedIcon icon={Icons.seed} />
                        {intl.formatMessage({ id: 'ACCOUNT_MANAGE_SEED_AND_ACCOUNT_LINK_TEXT' })}
                        <Icon icon="chevronRight" className={styles.arrow} />
                    </button>
                </Card>

                <Card>
                    <button type="button" className={styles.item} onClick={vm.openContacts}>
                        <RoundedIcon icon={Icons.person} />
                        {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                        <Icon icon="chevronRight" className={styles.arrow} />
                    </button>
                </Card>

                <Card>
                    <button type="button" className={styles.item} onClick={vm.openSettings}>
                        <RoundedIcon icon={Icons.settings} />
                        {intl.formatMessage({ id: 'SETTINGS_BTN_TEXT' })}
                        <Icon icon="chevronRight" className={styles.arrow} />
                    </button>
                </Card>
            </Content>
        </Container>
    )
})
