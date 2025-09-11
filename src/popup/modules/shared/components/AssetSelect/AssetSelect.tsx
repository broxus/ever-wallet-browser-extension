import { ForwardedRef, forwardRef, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { convertCurrency, convertEvers, formatCurrency, isTokenSymbol, SelectedAsset } from '@app/shared'
import { NativeAssetIcon } from '@app/popup/modules/shared/components/AssetIcon/NativeAssetIcon'

import { useSearch, useViewModel } from '../../hooks'
import { SearchInput } from '../Input'
import { Container, Content } from '../layout'
import { SlidingPanel } from '../SlidingPanel'
import { Icon } from '../Icon'
import { AssetIcon } from '../AssetIcon'
import { AssetSelectViewModel } from './AssetSelectViewModel'
import styles from './AssetSelect.module.scss'
import listStyles from './List.module.scss'
import { UsdtPrice } from '../UsdtPrice'

interface Props {
    value: SelectedAsset;
    address: string;
    className?: string;
    onChange(value: SelectedAsset): void
}

function AssetSelectInternal(props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element {
    const { value, address, className, onChange } = props
    const vm = useViewModel(AssetSelectViewModel, (model) => {
        model.address = address
        model.asset = value
    }, [address, value])
    const intl = useIntl()
    const search = useSearch(vm.list, vm.filter)

    const handleNativeAssetClick = useCallback(() => {
        onChange({ type: 'ever_wallet', data: { address }})
        vm.handleClose()
    }, [address, onChange])

    const rootTokenContract = value.type === 'token_wallet' ? value.data.rootTokenContract : undefined
    const symbol = rootTokenContract ? vm.knownTokens[rootTokenContract] : undefined
    const token = rootTokenContract ? vm.tokens[rootTokenContract] : undefined

    return (
        <>
            <div ref={ref} className={classNames(styles.select, className)} onClick={vm.handleOpen}>
                <div className={styles.wrap}>
                    {!rootTokenContract
                        ? <AssetIcon type="ever_wallet" className={styles.icon} />
                        : (
                            <AssetIcon
                                type="token_wallet"
                                className={styles.icon}
                                address={rootTokenContract}
                                old={symbol ? isTokenSymbol(symbol) && symbol.version === 'OldTip3v4' : false}
                            />
                        )}

                    <div className={styles.name}>
                        {token?.symbol ?? symbol?.name ?? vm.nativeCurrency}
                    </div>

                    <Icon
                        icon="chevronDown" className={styles.chevron} width={20}
                        height={20}
                    />
                </div>
                <div className={styles.balance}>
                    {intl.formatMessage({ id: 'INPUT_BALANCE' })}
                    &nbsp;
                    {formatCurrency(convertCurrency(vm.balance, vm.decimals), true)}
                </div>
            </div>

            <SlidingPanel
                whiteBg
                fullHeight
                active={vm.opened}
                onClose={vm.handleClose}
                title={intl.formatMessage({
                    id: 'SELECT_TOKEN',
                })}
            >
                <Container className={styles.container}>
                    <Content>
                        <SearchInput size="xs" className={styles.search} {...search.props} />

                        <div className={listStyles.list}>
                            <div className={listStyles.item} onClick={handleNativeAssetClick}>
                                <NativeAssetIcon className={listStyles.icon} />
                                <div className={listStyles.wrap}>
                                    <div className={listStyles.amount}>
                                        <div className={listStyles.balance}>
                                            {formatCurrency(convertEvers(vm.decimals, vm.everWalletState?.balance ?? '0'))}
                                        </div>
                                        <div className={listStyles.usd}>
                                            <UsdtPrice symbol="$" amount={vm.everWalletState?.balance ?? '0'} tokenRoot={token?.address} />
                                        </div>
                                    </div>
                                    <div className={listStyles.name}>{vm.nativeCurrency}</div>
                                </div>
                                {value.type === 'ever_wallet' ? (
                                    <Icon icon="check" className={listStyles.check} />
                                ) : <div className={listStyles.empty} />}
                            </div>

                            {search.list.map(({ symbol, token }) => {
                                if (!symbol) {
                                    return null
                                }

                                const balance = vm.tokenWalletAssets ? vm.tokenWalletStates[symbol.rootTokenContract]?.balance : '0'
                                const active = value.type === 'token_wallet' && value.data.rootTokenContract === symbol.rootTokenContract
                                const handleClick = () => {
                                    onChange({ type: 'token_wallet', data: { rootTokenContract: symbol.rootTokenContract }})
                                    vm.handleClose()
                                }
                                return (
                                    <div
                                        key={symbol.rootTokenContract}
                                        className={listStyles.item}
                                        onClick={handleClick}
                                    >
                                        <AssetIcon
                                            type="token_wallet"
                                            className={listStyles.icon}
                                            address={symbol.rootTokenContract}
                                            old={isTokenSymbol(symbol) && symbol.version === 'OldTip3v4'}
                                        />
                                        <div className={listStyles.wrap}>
                                            <div className={listStyles.amount}>
                                                <div className={listStyles.balance}>
                                                    {formatCurrency(convertCurrency(balance, symbol.decimals))}
                                                </div>
                                                <div className={listStyles.usd}>
                                                    <UsdtPrice symbol="$" amount={balance ?? '0'} tokenRoot={token?.address} />
                                                </div>
                                            </div>
                                            <div className={listStyles.name}>{token?.symbol ?? symbol.name}</div>
                                        </div>
                                        {active ? (
                                            <Icon icon="check" className={listStyles.check} />
                                        ) : <div className={listStyles.empty} />}
                                    </div>
                                )
                            })}
                        </div>
                    </Content>
                </Container>
            </SlidingPanel>
        </>
    )
}

export const AssetSelect = observer(forwardRef(AssetSelectInternal))
