import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button, Container, Content, Footer, Header, Navbar, RadioButton, useResolve, useSlidingPanel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { SeedSelectViewModel } from '@app/popup/modules/account/components/CreateAccountPage/SeedSelect/SeedSelectViewModel'
import { PasswordForm } from '@app/popup/modules/account/components/CreateAccountPage/PasswordForm/PasswordForm'

import styles from './SeedSelect.module.scss'

export const SeedSelect: React.FC = observer(() => {
    const panel = useSlidingPanel()
    const intl = useIntl()
    const navigate = useNavigate()
    const vm = useResolve(SeedSelectViewModel)
    const params = useParams()

    const seedIndex = React.useMemo(() => (
        params.seedIndex !== undefined ? parseInt(params.seedIndex, 10) : vm.keyIndex
    ), [params.seedIndex, vm.keyIndex])

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

    React.useEffect(() => {
        vm.setSeedIndex(seedIndex)
    }, [seedIndex])

    return (
        <Container>
            <Header className={styles.header}>
                <Navbar back={() => navigate(-1)}>
                    {intl.formatMessage({ id: 'SELECT_SEED' })}
                </Navbar>
            </Header>
            <Content>
                {vm.masterKeys.map((item, index) => (
                    <RadioButton
                        key={item.masterKey}
                        labelPosition="before"
                        className={styles.item}
                        value={item.masterKey}
                        onChange={() => navigate(`/create/${index}`, { replace: true })}
                        checked={index === seedIndex}
                    >
                        {item.name}
                    </RadioButton>
                ))}
            </Content>
            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button
                            key="next"
                            design="accent"
                            onClick={handlePasswordForm}
                        >
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
