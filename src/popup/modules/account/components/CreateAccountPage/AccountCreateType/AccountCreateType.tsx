import * as React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import { Container, Content, Header, Icon, Navbar, useResolve, useSlidingPanel } from '@app/popup/modules/shared'
import { PasswordForm } from '@app/popup/modules/account/components/CreateAccountPage/PasswordForm/PasswordForm'
import { SeedSelectStore } from '@app/popup/modules/account/components/CreateAccountPage/SeedSelectStore'

import styles from './AccountCreateType.module.scss'

export const AccountCreateType: React.FC = observer(() => {
    const intl = useIntl()
    const panel = useSlidingPanel()
    const navigate = useNavigate()
    const vm = useResolve(SeedSelectStore)

    const handlePasswordForm = () => {
        if (vm.masterKey?.signerName === 'ledger_key') {
            vm.submitLedger()
        }
        else if (vm.masterKey?.signerName === 'master_key') {
            panel.open({
                title: intl.formatMessage({
                    id: 'CONFIRM_BTN_TEXT',
                }),
                onClose: vm.resetError,
                render: () => (
                    <PasswordForm
                        error={vm.error}
                        loading={vm.loading}
                        name={vm.masterKey?.name}
                        onBack={panel.close}
                        onSubmit={vm.submitPassword}
                    />
                ),
            })
        }
    }

    return (
        <Container>
            <Header>
                <Navbar close="window">
                    {intl.formatMessage({ id: 'NEW_ACCOUNT' })}
                </Navbar>
            </Header>
            <Content>
                <button
                    className={styles.item}
                    onClick={() => {
                        if (vm.masterKeys.length === 1) {
                            vm.setSeed(vm.masterKeys[0].masterKey)
                            handlePasswordForm()
                        }
                        else {
                            navigate('/create')
                        }
                    }}
                >
                    <Icon icon="plus" className={styles.icon} />
                    <div className={styles.title}>
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
                    </div>
                    <div className={styles.desc}>
                        {intl.formatMessage({ id: 'CREATE_NEW_ACC_DESC' })}
                    </div>
                </button>
                <button
                    className={styles.item}
                    onClick={() => navigate('/external')}
                >
                    <Icon icon="import" className={styles.icon} />
                    <div className={styles.title}>
                        {intl.formatMessage({ id: 'ADD_EXTERNAL_ACCOUNT' })}
                    </div>
                    <div className={styles.desc}>
                        {intl.formatMessage({ id: 'ADD_EXTERNAL_ACC_DESC' })}
                    </div>
                </button>
            </Content>
        </Container>
    )
})
