import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import EverImg from '@app/popup/assets/img/stake/ever.svg'
import SteverImg from '@app/popup/assets/img/stake/stever.svg'
import DefiImg from '@app/popup/assets/img/stake/defi.svg'
import { Button, Container, Content, Footer, SlidingPanel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
// import { STAKE_APY_PERCENT, STAKE_TUTORIAL_URL } from '@app/shared'
// import DollarImg from '@app/popup/assets/img/stake/dollar.svg'

import styles from './StakeTutorial.module.scss'

type StakeTutorialProps = {
    onClose: ()=>void
    active: boolean
}

export const StakeTutorial = observer(({ onClose, active }:StakeTutorialProps): JSX.Element => {
    const intl = useIntl()

    return (
        <SlidingPanel active={active} title={intl.formatMessage({ id: 'STAKE_TUTORIAL_HEADER' })} onClose={onClose}>
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
                        <Button onClick={onClose} design="neutral">
                            {intl.formatMessage({ id: 'STAKE_TUTORIAL_BTN_TEXT' })}
                        </Button>
                    </FooterAction>

                </Footer>
            </Container>
        </SlidingPanel>
    )
})
