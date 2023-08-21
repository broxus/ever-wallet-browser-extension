import { observer } from 'mobx-react-lite'
import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, FormControl, Header, Navbar, Select, useViewModel } from '@app/popup/modules/shared'

import { DeployReceive } from '../DeployReceive'
import { PreparedMessage } from '../PreparedMessage'
import { DeployWalletViewModel, Step, WalletType } from './DeployWalletViewModel'

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

    const getPopupContainer = useCallback((trigger: any): HTMLElement => { // eslint-disable-line arrow-body-style
        return trigger.closest('.sliding-panel__content')
            ?? document.getElementById('root')
            ?? document.body
    }, [])

    if (!vm.sufficientBalance) {
        return (
            <DeployReceive
                account={vm.account}
                totalAmount={vm.totalAmount}
                currencyName={vm.nativeCurrency}
            />
        )
    }

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
                    <Select
                        options={walletTypesOptions}
                        value={vm.walletType}
                        getPopupContainer={getPopupContainer}
                        onChange={vm.onChangeWalletType}
                    />
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
