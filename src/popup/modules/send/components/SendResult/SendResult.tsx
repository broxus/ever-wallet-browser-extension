import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useLocation, type Location } from 'react-router'

import { Button, ButtonWithAutoFocus, Container, Content, Footer, Icon, useViewModel } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { RocketAnimation } from '@app/popup/modules/shared/components/RiveAnimation/Animations/RocketAnimation'
import successSvg from '@app/popup/assets/img/success-tx.svg'

import { SendResultViewModel } from './SendResultViewModel'
import styles from './SendResult.module.scss'

interface LocationState {
    messageHash?: string
    gasless?: boolean
}

export const SendResult = observer(() => {
    const intl = useIntl()
    const location = useLocation() as Location<LocationState>
    const vm = useViewModel(SendResultViewModel, (v) => {
        v.messageHash = location.state?.messageHash
        v.gasless = location.state?.gasless ?? false
    }, [location.state])

    return (
        <Container>
            <Content className={styles.content}>
                {vm.confirmed ? <div className={styles.image}><img src={successSvg} alt="Success" /></div> : <RocketAnimation /> }

                <p>{intl.formatMessage({ id: vm.confirmed ? 'SEND_MESSAGE_RESULT_CONFIRMED' : 'SEND_MESSAGE_RESULT_HEADER' })}</p>
            </Content>

            <Footer>
                {vm.confirmed ? (
                    <FooterAction>
                        <Button
                            design="neutral"
                            onClick={() => {
                                vm.openInExplorer(vm.transactionHash!)
                                closeCurrentWindow()
                            }}
                        >
                            <Icon icon="planet" width={16} height={16} />
                            {intl.formatMessage({ id: 'DETAILS' })}
                        </Button>
                        <Button
                            design="primary"
                            onClick={closeCurrentWindow}
                        >
                            {intl.formatMessage({ id: 'CLOSE_BTN_TEXT' })}
                        </Button>
                    </FooterAction>
                ) : (
                    <FooterAction>
                        <ButtonWithAutoFocus
                            design="primary"
                            onClick={closeCurrentWindow}
                        >
                            {intl.formatMessage({ id: 'OK_BTN_TEXT' })}
                        </ButtonWithAutoFocus>
                    </FooterAction>
                )}
            </Footer>
        </Container>
    )
})
