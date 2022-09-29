import { memo } from 'react'
import { useIntl } from 'react-intl'

import EverImg from '@app/popup/assets/img/stake/ever.svg'
import SteverImg from '@app/popup/assets/img/stake/stever.svg'
import DollarImg from '@app/popup/assets/img/stake/dollar.svg'
import DefiImg from '@app/popup/assets/img/stake/defi.svg'
import {
    Button,
    Container,
    Content,
    Footer,
    Header,
    useDrawerPanel,
} from '@app/popup/modules/shared'
import { STAKE_APY_PERCENT, STAKE_TUTORIAL_URL } from '@app/shared'

import './StakeTutorial.scss'

export const StakeTutorial = memo((): JSX.Element => {
    const drawer = useDrawerPanel()
    const intl = useIntl()

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
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_1' })}
                        </div>
                        <div className="stake-tutorial__item-desc">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_1' })}
                        </div>
                    </div>

                    <div className="stake-tutorial__item">
                        <div className="stake-tutorial__item-figure">
                            <img className="stake-tutorial__item-img" src={SteverImg} alt="" />
                        </div>
                        <div className="stake-tutorial__item-title">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_2' })}
                        </div>
                        <div className="stake-tutorial__item-desc">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_2' })}
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
                                    { url: STAKE_TUTORIAL_URL, apy: STAKE_APY_PERCENT },
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
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_4' })}
                        </div>
                        <div className="stake-tutorial__item-desc">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_4' })}
                        </div>
                    </div>
                </div>
            </Content>

            <Footer>
                <Button onClick={() => drawer.setPanel(undefined)}>
                    {intl.formatMessage({ id: 'STAKE_TUTORIAL_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
