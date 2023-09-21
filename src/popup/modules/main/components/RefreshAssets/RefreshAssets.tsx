import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import { Amount, AssetIcon, Button, Checkbox, Container, Content, Empty, Footer, PageLoader, useViewModel } from '@app/popup/modules/shared'

import { RefreshAssetsViewModel } from './RefreshAssetsViewModel'
import styles from './RefreshAssets.module.scss'

export const RefreshAssets = observer((): JSX.Element => {
    const vm = useViewModel(RefreshAssetsViewModel)
    const intl = useIntl()

    return (
        <PageLoader active={vm.refreshing}>
            <Container>
                <Content>
                    <h2>{intl.formatMessage({ id: 'REFRESH_TOKENS_TITLE' })}</h2>

                    {!vm.newTokens.length && (
                        <div className={styles.empty}>
                            <Empty />
                        </div>
                    )}

                    {vm.newTokens.length !== 0 && (
                        <div className={styles.list}>
                            {vm.newTokens.map(({ address, symbol, balance }) => {
                                const price = vm.prices[address]
                                const checked = vm.checked.has(address)
                                const handleToggle = () => vm.toggle(address)

                                return (
                                    <div key={address} className={styles.item} onClick={handleToggle}>
                                        <AssetIcon type="token_wallet" className={styles.icon} address={address} />
                                        <div className={styles.wrap}>
                                            <Amount
                                                className={styles.amount}
                                                value={balance}
                                                currency={symbol}
                                            />
                                            {price && (
                                                <Amount
                                                    className={styles.usd}
                                                    value={BigNumber(balance).times(price).toFixed()}
                                                    currency="USD"
                                                />
                                            )}
                                        </div>
                                        <Checkbox
                                            className={styles.checkbox}
                                            checked={checked}
                                            onChange={handleToggle}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Content>

                <Footer>
                    <Button
                        design="primary"
                        disabled={vm.checked.size === 0}
                        loading={vm.loading}
                        onClick={vm.submit}
                    >
                        {intl.formatMessage({ id: 'IMPORT_BTN_TEXT' })}
                    </Button>
                </Footer>
            </Container>
        </PageLoader>
    )
})
