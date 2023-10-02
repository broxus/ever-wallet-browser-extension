import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Amount, AssetIcon, Button, Chips, Container, Content, CopyButton, Footer, Header, Navbar, ParamsPanel, useConfirmation, useViewModel } from '@app/popup/modules/shared'
import { convertAddress, convertCurrency, convertEvers, NATIVE_CURRENCY } from '@app/shared'
import type { WithdrawRequest } from '@app/models'

import { WithdrawInfoViewModel } from './WithdrawInfoViewModel'
import styles from './WithdrawInfo.module.scss'

interface Props {
    withdrawRequest: WithdrawRequest;
    onRemove(request: WithdrawRequest): void;
}

export const WithdrawInfo = observer(({ withdrawRequest, onRemove }: Props): JSX.Element => {
    const vm = useViewModel(WithdrawInfoViewModel, (model) => {
        model.withdrawRequest = withdrawRequest
    })
    const intl = useIntl()
    const confirmation = useConfirmation()

    const handleRemove = async () => {
        const confirmed = await confirmation.show({
            title: intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_CONFIRMATION_TITLE' }),
            body: intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_CONFIRMATION_TEXT' }),
            confirmBtnText: intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_CONFIRMATION_BTN_TEXT' }),
        })

        if (confirmed) {
            vm.close()
            onRemove(vm.withdrawRequest)
        }
    }

    const statusLabel = (
        <Chips type="warning">
            {intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_UNSTAKING_IN_PROGRESS' })}
        </Chips>
    )

    return (
        <Container>
            <Header>
                <Navbar back={vm.close} />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'TRANSACTION_PANEL_HEADER' })}</h2>

                {/* <div className="withdraw-info__notification">
                    {intl.formatMessage({ id: 'STAKE_WITHDRAW_NOTIFICATION' })}
                </div> */}

                <ParamsPanel className={styles.panel}>
                    <ParamsPanel.Param label={statusLabel} row>
                        <span className={styles.date}>
                            {new Date(vm.timestamp).toLocaleString()}
                        </span>
                    </ParamsPanel.Param>

                    <ParamsPanel.Param>
                        <div className={styles.info}>
                            {intl.formatMessage(
                                { id: 'STAKE_FORM_UNSTAKE_INFO' },
                                { hours: vm.withdrawTimeHours },
                            )}
                        </div>
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}>
                        {intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_TYPE_LIQUID_STAKING' })}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_UNSTAKE_AMOUNT' })}>
                        <Amount
                            icon={<AssetIcon type="token_wallet" address={vm.stEverTokenRoot} />}
                            value={convertCurrency(vm.amount, vm.decimals)}
                            currency={vm.currencyName}
                        />
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_FORM_EXCHANGE_RATE' })}>
                        {vm.exchangeRate && (
                            <span>1 stEVER ≈ {vm.exchangeRate} EVER</span>
                        )}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_RECEIVE' })}>
                        {vm.receive && (
                            <Amount
                                icon={<AssetIcon type="ever_wallet" />}
                                value={convertEvers(vm.receive)}
                                currency={NATIVE_CURRENCY}
                                approx
                            />
                        )}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TO' })}>
                        <CopyButton text={vm.transfer.account.tonWallet.address}>
                            <button type="button" className={styles.copy}>
                                {convertAddress(vm.transfer.account.tonWallet.address)}
                            </button>
                        </CopyButton>
                    </ParamsPanel.Param>

                    <ParamsPanel.Param>
                        <div className={styles.info}>
                            {intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_BTN_HINT' })}
                        </div>
                    </ParamsPanel.Param>
                </ParamsPanel>
            </Content>

            <Footer>
                <Button design="secondary" className={styles.btn} onClick={handleRemove}>
                    {intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
