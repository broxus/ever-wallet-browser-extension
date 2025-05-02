import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button, Container, Content, Footer, Icon, StakeStore, useResolve } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { StakeTransferStore } from '../../store'
import styles from './StakeResult.module.scss'

export const StakeResult = observer((): JSX.Element => {
    const { withdrawTimeHours } = useResolve(StakeStore)
    const { messageParams, stSymbol } = useResolve(StakeTransferStore)
    const intl = useIntl()

    return (
        <Container className="stake-result">
            {messageParams?.action === 'stake' && (
                <Content className={styles.content}>
                    <Icon icon="rocket" width={64} height={64} />
                    <p className={styles.text}>
                        {intl.formatMessage({ id: 'STAKE_RESULT_STAKE_TEXT' }, { symbol: stSymbol })}
                    </p>
                </Content>
            )}
            {messageParams?.action === 'unstake' && (
                <Content className={styles.content}>
                    <Icon icon="rocket" width={64} height={64} />
                    <p className={styles.text}>
                        {intl.formatMessage(
                            { id: 'STAKE_RESULT_UNSTAKE_TEXT' },
                            { hours: withdrawTimeHours },
                        )}
                    </p>
                </Content>
            )}
            {messageParams?.action === 'cancel' && (
                <Content className={styles.content}>
                    <Icon icon="rocket" width={64} height={64} />
                    <p className={styles.text}>
                        {intl.formatMessage({ id: 'STAKE_RESULT_WITHDRAW_CANCEL_TEXT' }, { symbol: stSymbol })}
                    </p>
                </Content>
            )}
            <Footer>
                <FooterAction>
                    <Button width={200} design="neutral" onClick={closeCurrentWindow}>
                        {intl.formatMessage({ id: 'OK_BTN_TEXT' })}
                    </Button>
                </FooterAction>

            </Footer>
        </Container>
    )
})
