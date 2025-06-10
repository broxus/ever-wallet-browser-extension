import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import StakeResultImg from '@app/popup/assets/img/in-progress.svg'
import { Button, ConnectionStore, Container, Content, Footer, StakeStore, useResolve } from '@app/popup/modules/shared'

import './StakeResult.scss'

interface Props {
    type: 'stake' | 'unstake' | 'cancel';
    onNext: () => void;
}

export const StakeResult = observer(({ type, onNext }: Props): JSX.Element => {
    const { withdrawTimeHours, config } = useResolve(StakeStore)
    const { symbol: nativeSymbol } = useResolve(ConnectionStore)
    const intl = useIntl()
    const symbol = config?.tokenSymbol ?? ''

    return (
        <Container className="stake-result">
            {type === 'stake' && (
                <Content className="stake-result__content">
                    <img src={StakeResultImg} alt="" />
                    <h1 className="stake-result__header">
                        {intl.formatMessage({ id: 'STAKE_RESULT_STAKE_HEADER' })}
                    </h1>
                    <p className="stake-result__text">
                        {intl.formatMessage({ id: 'STAKE_RESULT_STAKE_TEXT' }, { symbol })}
                    </p>
                </Content>
            )}
            {type === 'unstake' && (
                <Content className="stake-result__content">
                    <img src={StakeResultImg} alt="" />
                    <h1 className="stake-result__header">
                        {intl.formatMessage({ id: 'STAKE_RESULT_UNSTAKE_HEADER' })}
                    </h1>
                    <p className="stake-result__text">
                        {intl.formatMessage(
                            { id: 'STAKE_RESULT_UNSTAKE_TEXT' },
                            { hours: withdrawTimeHours, symbol: nativeSymbol },
                        )}
                    </p>
                </Content>
            )}
            {type === 'cancel' && (
                <Content className="stake-result__content">
                    <img src={StakeResultImg} alt="" />
                    <h1 className="stake-result__header">
                        {intl.formatMessage({ id: 'STAKE_RESULT_WITHDRAW_CANCEL_HEADER' })}
                    </h1>
                    <p className="stake-result__text">
                        {intl.formatMessage({ id: 'STAKE_RESULT_WITHDRAW_CANCEL_TEXT' }, { symbol })}
                    </p>
                </Content>
            )}
            <Footer>
                <Button onClick={onNext}>
                    {intl.formatMessage({ id: 'CONTINUE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
