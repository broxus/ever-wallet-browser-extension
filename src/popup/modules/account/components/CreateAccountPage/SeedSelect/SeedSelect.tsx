import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button, Container, Content, Footer, Header, Navbar, RadioButton, useResolve, useSlidingPanel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { PasswordForm } from '@app/popup/modules/account/components/CreateAccountPage/PasswordForm/PasswordForm'
import { SeedSelectStore } from '@app/popup/modules/account/components/CreateAccountPage/SeedSelectStore'

import styles from './SeedSelect.module.scss'

export const SeedSelect: React.FC = observer(() => {
    const panel = useSlidingPanel()
    const intl = useIntl()
    const navigate = useNavigate()
    const vm = useResolve(SeedSelectStore)
    const params = useParams()

    const seed = React.useMemo(() => params.seed ?? vm.seed, [params.seed, vm.seed])

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
        else if (vm.masterKey?.signerName === 'encrypted_key') {
            navigate(`/create/${vm.masterKey.masterKey}/account`)
        }
    }

    const selectedRef = React.useRef<HTMLDivElement | null>(null)

    React.useEffect(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })
    }, [])

    React.useEffect(() => {
        vm.setSeed(seed)
    }, [seed])

    return (
        <Container>
            <Header className={styles.header}>
                <Navbar back={() => navigate(-1)}>
                    {intl.formatMessage({ id: 'SELECT_SEED' })}
                </Navbar>
            </Header>
            <Content>
                {vm.masterKeys
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(item => (
                        <div key={item.masterKey} ref={item.masterKey === seed ? selectedRef : null}>
                            <RadioButton
                                key={item.masterKey}
                                labelPosition="before"
                                className={styles.item}
                                value={item.masterKey}
                                onChange={() => navigate(`/create/${item.masterKey}`, { replace: true })}
                                checked={item.masterKey === seed}
                            >
                                {item.name}
                            </RadioButton>
                        </div>
                    ))}
            </Content>
            <Footer layer>
                <FooterAction>
                    <Button
                        key="next"
                        design="accent"
                        onClick={handlePasswordForm}
                    >
                        {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
