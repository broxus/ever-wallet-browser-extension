import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import {
    Amount,
    AssetIcon,
    Button,
    Checkbox,
    Container,
    Content,
    Empty,
    Footer,
    Loader,
    UsdtPrice,
    useViewModel,
} from '@app/popup/modules/shared'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'
import { multiplier } from '@app/shared'

import { RefreshAssetsViewModel } from './RefreshAssetsViewModel'
import styles from './RefreshAssets.module.scss'

export const RefreshAssets = observer((): JSX.Element => {
    const vm = useViewModel(RefreshAssetsViewModel)
    const intl = useIntl()

    return (
        <>
            <SlidingPanelHeader
                title={intl.formatMessage({ id: 'REFRESH_TOKENS_TITLE' })}
                onClose={vm.close}
            />
            <Container>
                <Content>
                    {vm.newTokens.length !== 0
                        && (
                            <div className={styles.all}>
                                <button onClick={() => vm.selectAll()}>{intl.formatMessage({ id: 'SELECT_ALL' })}</button>
                            </div>
                        )}

                    {!vm.refreshing && !vm.newTokens.length && (
                        <div className={styles.empty}>
                            <Empty />
                        </div>
                    )}

                    {vm.newTokens.length !== 0 && (
                        <div className={styles.list}>
                            {vm.newTokens.map(({ address, symbol, balance, decimals }) => {
                                const checked = vm.checked.has(address)
                                const handleToggle = () => vm.toggle(address)

                                return (
                                    <div
                                        key={address}
                                        onClick={vm.loading ? undefined : handleToggle}
                                        className={styles.item}
                                    >
                                        <AssetIcon type="token_wallet" className={styles.icon} address={address} />
                                        <div className={styles.wrap}>
                                            <div className={styles.left}>
                                                <div className={styles.amount}>
                                                    <Amount className={styles.amount} value={balance} />
                                                </div>
                                                <div className={styles.symbol}>
                                                    {symbol}
                                                </div>
                                            </div>
                                            <div className={styles.right}>
                                                <UsdtPrice symbol="$" amount={balance ? BigNumber(balance).times(multiplier(decimals)).toString() : '0'} tokenRoot={address} />
                                            </div>
                                        </div>
                                        <Checkbox
                                            disabled={vm.loading}
                                            className={styles.checkbox}
                                            checked={checked}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {vm.refreshing && (
                        <div className={styles.loader}>
                            <Loader size={24} />
                        </div>
                    )}
                </Content>

                <Footer className={styles.footer}>
                    <Button
                        design="accent" disabled={vm.checked.size === 0} loading={vm.loading}
                        onClick={vm.submit}
                    >
                        {intl.formatMessage({ id: 'ADD_BTN_TEXT' })}
                    </Button>
                </Footer>
            </Container>
        </>
    )
})
