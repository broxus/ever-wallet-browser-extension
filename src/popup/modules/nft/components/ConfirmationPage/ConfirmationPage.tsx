import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'
import { useIntl } from 'react-intl'

import { ButtonWithAutoFocus, Container, Content, Footer, Icon, useViewModel } from '@app/popup/modules/shared'
import { EnterSendPassword } from '@app/popup/modules/send'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import styles from './ConfirmationPage.module.scss'
import { ConfirmationPageViewModel, Step } from './ConfirmationPageViewModel'

export const ConfirmationPage = observer((): JSX.Element => {
    const intl = useIntl()
    const vm = useViewModel(ConfirmationPageViewModel)
    const navigate = useNavigate()


    if (vm.step.value === Step.TransactionSent) {
        return (
            <Container>
                <Content className={styles.sentContent}>
                    <Icon icon="rocket" />
                    <p>{intl.formatMessage({ id: 'NFT_SEND_RESULT_HEADER' })}</p>
                </Content>

                <Footer>
                    <FooterAction>
                        <ButtonWithAutoFocus
                            design="neutral"
                            onClick={vm.close}
                        >
                            {intl.formatMessage({ id: 'OK_BTN_TEXT' })}
                        </ButtonWithAutoFocus>
                    </FooterAction>
                </Footer>
            </Container>
        )
    }

    return (
        <EnterSendPassword
            account={vm.transfer.account}
            keyEntries={vm.transfer.selectableKeys.keys}
            keyEntry={vm.transfer.key!}
            amount={vm.transfer.messageParams?.amount}
            recipient={vm.transfer.messageParams?.recipient}
            fees={vm.transfer.fees}
            error={vm.error}
            txErrors={vm.transfer.txErrors}
            txErrorsLoaded={vm.transfer.txErrorsLoaded}
            balanceError={vm.balanceError}
            loading={vm.loading}
            context={vm.context}
            onSubmit={vm.submit}
            onChangeKeyEntry={vm.transfer.setKey}
            onBack={() => navigate('/')}
        />
    )
})
