import { ForwardedRef, forwardRef, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'
import { SelectedAsset } from '@app/shared'

import { useSearch, useViewModel } from '../../hooks'
import { Input, SearchInput } from '../Input'
import { Container, Content } from '../layout'
import { SlidingPanel } from '../SlidingPanel'
import { AssetIcon, EverAssetIcon } from '../AssetIcon'
import { AssetSelectViewModel } from './AssetSelectViewModel'
import styles from './AssetSelect.module.scss'

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
    }, [address])
    const intl = useIntl()
    const search = useSearch(vm.list, vm.filter)

    const handleNativeAssetClick = useCallback(() => {
        onChange({ type: 'ever_wallet', data: { address }})
        vm.handleClose()
    }, [address, onChange])

    const rootTokenContract = value.type === 'token_wallet' ? value.data.rootTokenContract : undefined
    const symbol = rootTokenContract ? vm.knownTokens[rootTokenContract] : undefined
    const token = rootTokenContract ? vm.tokens[rootTokenContract] : undefined
    const suffix = <Icons.ChevronRight className={styles.chevron} />
    const prefix = rootTokenContract
        ? (
            <AssetIcon
                type="token_wallet"
                className={styles.icon}
                address={rootTokenContract}
                old={symbol ? symbol.version !== 'Tip3' : false}
            />
        )
        : <EverAssetIcon className={styles.icon} />

    return (
        <>
            <Input
                readOnly
                type="text"
                ref={ref}
                className={classNames(styles.input, className)}
                prefix={prefix}
                suffix={suffix}
                value={token?.symbol ?? symbol?.name ?? vm.nativeCurrency}
                onClick={vm.handleOpen}
            />

            <SlidingPanel active={vm.opened} onClose={vm.handleClose} whiteBg>
                <Container>
                    <Content>
                        <SearchInput design="gray" className={styles.search} {...search.props} />
                        <h2>{intl.formatMessage({ id: 'SELECT_TOKEN' })}</h2>
                        <div className={styles.list}>
                            <div className={styles.item} onClick={handleNativeAssetClick}>
                                <EverAssetIcon className={styles.icon} />
                                <div className={styles.name}>{vm.nativeCurrency}</div>
                                {value.type === 'ever_wallet' && (
                                    <Icons.Check className={styles.check} />
                                )}
                            </div>

                            {search.list.map(({ symbol, token }) => {
                                const active = value.type === 'token_wallet' && value.data.rootTokenContract === symbol.rootTokenContract
                                const handleClick = () => {
                                    onChange({ type: 'token_wallet', data: { rootTokenContract: symbol.rootTokenContract }})
                                    vm.handleClose()
                                }
                                return (
                                    <div key={symbol.rootTokenContract} className={styles.item} onClick={handleClick}>
                                        <AssetIcon
                                            type="token_wallet"
                                            className={styles.icon}
                                            address={symbol.rootTokenContract}
                                            old={symbol.version !== 'Tip3'}
                                        />
                                        <div className={styles.name}>{token?.symbol ?? symbol.name}</div>
                                        {active && (
                                            <Icons.Check className={styles.check} />
                                        )}
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
