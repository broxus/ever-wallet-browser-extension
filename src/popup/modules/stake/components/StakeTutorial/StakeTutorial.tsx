import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import EverImg from '@app/popup/assets/img/stake/ever.svg'
import SteverImg from '@app/popup/assets/img/stake/stever.svg'
import DollarImg from '@app/popup/assets/img/stake/dollar.svg'
import DefiImg from '@app/popup/assets/img/stake/defi.svg'
import { Button, ConnectionStore, Container, Content, Footer, Header, StakeStore, useDrawerPanel, useResolve } from '@app/popup/modules/shared'
import { STAKE_TUTORIAL_URL } from '@app/shared'

import './StakeTutorial.scss'

export const StakeTutorial = observer((): JSX.Element => {
    const drawer = useDrawerPanel()
    const intl = useIntl()
    const { apy, config } = useResolve(StakeStore)
    const { symbol: nativeSymbol } = useResolve(ConnectionStore)
    const symbol = config?.tokenSymbol || ''

    return (
        <Container className="stake-tutorial">
            <Header className="stake-tutorial__header">
                <h2>
                    {intl.formatMessage({ id: 'STAKE_TUTORIAL_HEADER' })}
                </h2>
            </Header>

            <Content className="stake-tutorial__content">
                <div className="stake-tutorial__items">
                    <div className="stake-tutorial__item">
                        <div className="stake-tutorial__item-figure">
                            <img className="stake-tutorial__item-img" src={EverImg} alt="" />
                        </div>
                        <div className="stake-tutorial__item-title">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_1' }, { symbol: nativeSymbol })}
                        </div>
                        <div className="stake-tutorial__item-desc">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_1' }, { symbol: nativeSymbol })}
                        </div>
                    </div>

                    <div className="stake-tutorial__item">
                        <div className="stake-tutorial__item-figure">
                            <img className="stake-tutorial__item-img" src={SteverImg} alt="" />
                        </div>
                        <div className="stake-tutorial__item-title">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_2' }, { symbol })}
                        </div>
                        <div className="stake-tutorial__item-desc">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_2' }, { symbol })}
                        </div>
                    </div>

                    <div className="stake-tutorial__item">
                        <div className="stake-tutorial__item-figure">
                            <img className="stake-tutorial__item-img _shadow" src={DollarImg} alt="" />
                        </div>
                        <div className="stake-tutorial__item-title">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_3' })}
                        </div>
                        <div
                            className="stake-tutorial__item-desc"
                            dangerouslySetInnerHTML={{
                                __html: intl.formatMessage(
                                    { id: 'STAKE_TUTORIAL_DESCRIPTION_3' },
                                    { url: STAKE_TUTORIAL_URL, apy, symbol },
                                    { ignoreTag: true },
                                ),
                            }}
                        />
                    </div>

                    <div className="stake-tutorial__item">
                        <div className="stake-tutorial__item-figure">
                            <img className="stake-tutorial__item-img _shadow" src={DefiImg} alt="" />
                        </div>
                        <div className="stake-tutorial__item-title">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_4' }, { symbol })}
                        </div>
                        <div className="stake-tutorial__item-desc">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_4' }, { symbol })}
                        </div>
                    </div>
                </div>
            </Content>

            <Footer>
                <Button onClick={drawer.close}>
                    {intl.formatMessage({ id: 'STAKE_TUTORIAL_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
