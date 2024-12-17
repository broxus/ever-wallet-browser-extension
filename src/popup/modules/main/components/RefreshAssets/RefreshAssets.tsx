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
    Icon,
    Loader,
    useViewModel,
} from '@app/popup/modules/shared'

import { RefreshAssetsViewModel } from './RefreshAssetsViewModel'
import styles from './RefreshAssets.module.scss'

export const RefreshAssets = observer((): JSX.Element => {
    const vm = useViewModel(RefreshAssetsViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <h2 className={styles.title}>{intl.formatMessage({ id: 'REFRESH_TOKENS_TITLE' })}</h2>
                <Button
                    shape="icon" size="s" design="transparency"
                    className={styles.close} onClick={vm.close}
                >
                    <Icon icon="x" width={16} height={16} />
                </Button>
                <div className={styles.all}>
                    <button onClick={() => vm.selectAll()}>{intl.formatMessage({ id: 'SELECT_ALL' })}</button>
                </div>

                {!vm.refreshing && !vm.newTokens.length && (
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
                                <div
                                    key={address}
                                    onClick={vm.loading ? undefined : handleToggle}
                                    className={styles.item}
                                >
                                    <AssetIcon type="token_wallet" className={styles.icon} address={address} />
                                    <div className={styles.wrap}>
                                        <Amount
                                            precise className={styles.amount} value={balance}
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
                                        disabled={vm.loading}
                                        className={styles.checkbox}
                                        checked={checked}
                                        onChange={handleToggle}
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
    )
})
