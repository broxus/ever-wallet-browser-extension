import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button, Container, Content, Footer, Loader, StakeStore, useResolve } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'

import { StakeTransferStore } from '../../store'
import styles from './StakeResult.module.scss'

export const StakeResult = observer((): JSX.Element => {
    const { withdrawTimeHours } = useResolve(StakeStore)
    const { messageParams } = useResolve(StakeTransferStore)
    const intl = useIntl()

    return (
        <Container className="stake-result">
            {messageParams?.action === 'stake' && (
                <Content className={styles.content}>
                    <Loader large />
                    <div>
                        <h2>{intl.formatMessage({ id: 'STAKE_RESULT_STAKE_HEADER' })}</h2>
                        <p className={styles.text}>
                            {intl.formatMessage({ id: 'STAKE_RESULT_STAKE_TEXT' })}
                        </p>
                    </div>
                </Content>
            )}
            {messageParams?.action === 'unstake' && (
                <Content className={styles.content}>
                    <Loader large />
                    <div>
                        <h2>{intl.formatMessage({ id: 'STAKE_RESULT_UNSTAKE_HEADER' })}</h2>
                        <p className={styles.text}>
                            {intl.formatMessage(
                                { id: 'STAKE_RESULT_UNSTAKE_TEXT' },
                                { hours: withdrawTimeHours },
                            )}
                        </p>
                    </div>
                </Content>
            )}
            {messageParams?.action === 'cancel' && (
                <Content className={styles.content}>
                    <Loader large />
                    <div>
                        <h2>{intl.formatMessage({ id: 'STAKE_RESULT_WITHDRAW_CANCEL_HEADER' })}</h2>
                        <p className={styles.text}>
                            {intl.formatMessage({ id: 'STAKE_RESULT_WITHDRAW_CANCEL_TEXT' })}
                        </p>
                    </div>
                </Content>
            )}
            <Footer>
                <Button onClick={closeCurrentWindow}>
                    {intl.formatMessage({ id: 'CONTINUE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
