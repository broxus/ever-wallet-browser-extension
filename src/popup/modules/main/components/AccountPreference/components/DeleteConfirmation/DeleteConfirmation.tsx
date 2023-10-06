import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

import { convertAddress } from '@app/shared'
import { Amount, Button, Container, Content, Footer, ParamsPanel, Space, useViewModel } from '@app/popup/modules/shared'

import { DeleteConfirmationViewModel } from './DeleteConfirmationViewModel'
import styles from './DeleteConfirmation.module.scss'

interface Props {
    address: string;
    onConfirm(): void;
}

export const DeleteConfirmation = observer(({ address, onConfirm }: Props): JSX.Element | null => {
    const vm = useViewModel(DeleteConfirmationViewModel, (model) => {
        model.address = address
    }, [address])
    const intl = useIntl()

    const handleConfirm = useCallback(() => {
        vm.handle.close()
        onConfirm()
    }, [onConfirm])

    if (!vm.account) return null

    return (
        <Container>
            <Content>
                <h2 className={styles.title}>
                    {intl.formatMessage(
                        { id: 'REMOVE_ACCOUNT_CONFIRMATION_TITLE' },
                        { name: vm.account.name ?? convertAddress(vm.account.tonWallet.address) },
                    )}
                </h2>
                <p className={styles.body}>
                    {intl.formatMessage({ id: 'REMOVE_ACCOUNT_CONFIRMATION_TEXT' })}
                </p>
                <ParamsPanel className={styles.panel}>
                    {vm.balance && (
                        <ParamsPanel.Param className={styles.param} label={intl.formatMessage({ id: 'TOTAL_BALANCE_LABEL' })}>
                            <Amount value={vm.balance} currency="USD" />
                        </ParamsPanel.Param>
                    )}
                    <ParamsPanel.Param className={styles.param} label={intl.formatMessage({ id: 'ADDRESS_LABEL' })}>
                        {vm.account.tonWallet.address}
                    </ParamsPanel.Param>
                </ParamsPanel>
            </Content>
            <Footer>
                <Space direction="column" gap="s">
                    <Button design="primary" onClick={vm.handle.close}>
                        {intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                    </Button>
                    <Button design="secondary" className={styles.btn} onClick={handleConfirm}>
                        {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
