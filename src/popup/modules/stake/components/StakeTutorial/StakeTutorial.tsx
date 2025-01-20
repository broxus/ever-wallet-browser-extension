import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import EverImg from '@app/popup/assets/img/stake/ever.svg'
import SteverImg from '@app/popup/assets/img/stake/stever.svg'
import DefiImg from '@app/popup/assets/img/stake/defi.svg'
import { Button, Container, Content, Footer, SlidingPanel } from '@app/popup/modules/shared'
// import { STAKE_APY_PERCENT, STAKE_TUTORIAL_URL } from '@app/shared'
// import DollarImg from '@app/popup/assets/img/stake/dollar.svg'

import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import styles from './StakeTutorial.module.scss'

export const StakeTutorial = observer((): JSX.Element => {
    const intl = useIntl()
    const navigate = useNavigate()

    return (
        <SlidingPanel active title={intl.formatMessage({ id: 'STAKE_TUTORIAL_HEADER' })} onClose={() => navigate('/')}>
            <Container>
                <Content>
                    <div className={styles.item}>
                        <img className={styles.img} src={EverImg} alt="" />
                        <div className={styles.wrap}>
                            <div className={styles.label}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_1' })}
                            </div>
                            <div className={styles.text}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_1' })}
                            </div>
                        </div>
                    </div>

                    <div className={styles.item}>
                        <img className={styles.img} src={SteverImg} alt="" />
                        <div className={styles.wrap}>
                            <div className={styles.label}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_2' })}
                            </div>
                            <div className={styles.text}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_2' })}
                            </div>
                        </div>
                    </div>

                    {/* <div className={styles.item}>
                        <img className={styles.img} src={DollarImg} alt="" />
                        <div className={styles.wrap}>
                            <div className={styles.label}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_3' })}
                            </div>
                            <div
                                className={styles.text}
                                dangerouslySetInnerHTML={{
                                    __html: intl.formatMessage(
                                        { id: 'STAKE_TUTORIAL_DESCRIPTION_3' },
                                        { url: STAKE_TUTORIAL_URL, apy: STAKE_APY_PERCENT },
                                        { ignoreTag: true },
                                    ),
                                }}
                            />
                        </div>
                    </div> */}

                    <div className={styles.item}>
                        <img className={styles.img} src={DefiImg} alt="" />
                        <div className={styles.wrap}>
                            <div className={styles.label}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_4' })}
                            </div>
                            <div className={styles.text}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_4' })}
                            </div>
                        </div>
                    </div>
                </Content>

                <Footer>
                    <FooterAction>
                        <Button onClick={() => navigate('/')} design="neutral">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_BTN_TEXT' })}
                        </Button>
                    </FooterAction>

                </Footer>
            </Container>
        </SlidingPanel>
    )
})
