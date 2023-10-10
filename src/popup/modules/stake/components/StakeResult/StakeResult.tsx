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
                    <p className={styles.text}>
                        {intl.formatMessage({ id: 'STAKE_RESULT_STAKE_TEXT' })}
                    </p>
                </Content>
            )}
            {messageParams?.action === 'unstake' && (
                <Content className={styles.content}>
                    <Loader large />
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
                    <Loader large />
                    <p className={styles.text}>
                        {intl.formatMessage({ id: 'STAKE_RESULT_WITHDRAW_CANCEL_TEXT' })}
                    </p>
                </Content>
            )}
            <Footer>
                <Button onClick={closeCurrentWindow}>
                    {intl.formatMessage({ id: 'OK_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
