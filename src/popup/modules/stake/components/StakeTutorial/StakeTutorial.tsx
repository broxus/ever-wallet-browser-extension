import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import DefiImg from '@app/popup/assets/img/stake/defi.svg'
import { AssetIcon, Button, Container, Content, Footer, SlidingPanel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
// import { STAKE_APY_PERCENT, STAKE_TUTORIAL_URL } from '@app/shared'
// import DollarImg from '@app/popup/assets/img/stake/dollar.svg'

import styles from './StakeTutorial.module.scss'

type StakeTutorialProps = {
    onClose: () => void
    active: boolean
    symbol: string
    receiveSymbol: string
    stTokenRoot: string
}

export const StakeTutorial = observer(({
 onClose,
    active, receiveSymbol, symbol, stTokenRoot,
}:StakeTutorialProps) => {
    const intl = useIntl()

    return (
        <SlidingPanel active={active} title={intl.formatMessage({ id: 'STAKE_TUTORIAL_HEADER' })} onClose={onClose}>
            <Container>
                <Content>
                    <div className={styles.item}>
                        <AssetIcon type="ever_wallet" className={styles.img} />
                        <div className={styles.wrap}>
                            <div className={styles.label}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_1' }, { symbol })}
                            </div>
                            <div className={styles.text}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_1' }, { symbol })}
                            </div>
                        </div>
                    </div>

                    <div className={styles.item}>
                        <AssetIcon type="token_wallet" address={stTokenRoot} className={styles.img} />
                        <div className={styles.wrap}>
                            <div className={styles.label}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_2' }, { symbol: receiveSymbol })}
                            </div>
                            <div className={styles.text}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_2' }, { symbol: receiveSymbol })}
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
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_TITLE_4' }, { symbol })}
                            </div>
                            <div className={styles.text}>
                                {intl.formatMessage({ id: 'STAKE_TUTORIAL_DESCRIPTION_4' }, { symbol })}
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
