import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Button, Checkbox, Container, Content, Footer, FormControl, Header, Navbar, useViewModel } from '@app/popup/modules/shared'

import { PreparedMessage } from '../PreparedMessage'
import { DeployWalletViewModel, Step, WalletType } from './DeployWalletViewModel'
import styles from './DeployWallet.module.scss'

interface OptionType {
    value: WalletType;
    label: string;
}

export const DeployWallet = observer((): JSX.Element | null => {
    const vm = useViewModel(DeployWalletViewModel)
    const intl = useIntl()

    const walletTypesOptions = useMemo<OptionType[]>(() => [
        {
            label: intl.formatMessage({ id: 'DEPLOY_WALLET_SELECT_WALLET_STANDARD' }),
            value: WalletType.Standard,
        },
        {
            label: intl.formatMessage({ id: 'DEPLOY_WALLET_SELECT_WALLET_MULTISIG' }),
            value: WalletType.Multisig,
        },
    ], [])

    if (vm.step.is(Step.DeployMessage)) {
        return (
            <PreparedMessage
                keyEntry={vm.selectedDerivedKeyEntry}
                balance={vm.everWalletState?.balance}
                fees={vm.fees}
                loading={vm.loading}
                error={vm.error}
                currencyName={vm.nativeCurrency}
                onSubmit={vm.onSubmit}
                onBack={vm.onBack}
            />
        )
    }

    return (
        <Container>
            <Header>
                <Navbar back={vm.onBack}>
                    {intl.formatMessage({ id: 'DEPLOY_WALLET_SELECT_TYPE_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <FormControl label={intl.formatMessage({ id: 'DEPLOY_WALLET_TYPE_LABEL' })}>
                    <div className={styles.pane}>
                        {walletTypesOptions.map(({ label, value }) => (
                            <Checkbox
                                labelPosition="before"
                                key={value}
                                className={styles.checkbox}
                                checked={value === vm.walletType}
                                onChange={() => vm.onChangeWalletType(value)}
                            >
                                {label}
                            </Checkbox>
                        ))}
                    </div>
                </FormControl>
            </Content>

            <Footer>
                <Button onClick={vm.onNext}>
                    {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
