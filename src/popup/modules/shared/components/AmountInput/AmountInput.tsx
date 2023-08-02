import type * as nt from '@broxus/ever-wallet-wasm'
import { ForwardedRef, forwardRef, InputHTMLAttributes } from 'react'
import { FormattedMessage } from 'react-intl'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { convertCurrency, SelectedAsset } from '@app/shared'

import { useViewModel } from '../../hooks'
import { Input } from '../Input'
import { FormControl } from '../FormControl'
import { Amount } from '../Amount'
import { AmountInputViewModel } from './AmountInputViewModel'
import styles from './AmountInput.module.scss'

type Keys = 'className' | 'autoFocus' | 'name' | 'onChange' | 'onBlur'
type Props = Pick<InputHTMLAttributes<HTMLInputElement>, Keys> & {
    value: string;
    account: nt.AssetsList;
    asset: SelectedAsset;
    invalid?: boolean;
}

function AmountInputInternal(props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element {
    const { value, className, name, account, asset, invalid, onChange, ...rest } = props
    const vm = useViewModel(AmountInputViewModel, (model) => {
        model.account = account
        model.asset = asset
    }, [account, asset])

    const handleMax = () => {
        let value = convertCurrency(vm.balance, vm.decimals)

        if (!asset) { // native currency
            value = BigNumber.max(0, BigNumber.sum(value, '-0.1')).toFixed()
        }

        onChange?.({
            target: {
                value,
                name: name ?? '',
            },
        } as any)
    }

    const suffix = (
        <button className={styles.btn} type="button" onClick={handleMax}>
            Max
        </button>
    )

    const amount = <Amount value={convertCurrency(vm.balance, vm.decimals)} currency={vm.currencyName} />
    const label = (
        <span className={styles.amount}>
            <FormattedMessage
                id="AMOUNT_INPUT_LABEL"
                values={{
                    amount,
                    span: (...parts) => <span>{parts}</span>,
                }}
            />
        </span>
    )

    return (
        <FormControl label={label} invalid={invalid} className={className}>
            <Input
                {...rest}
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                ref={ref}
                value={value}
                name={name}
                onChange={onChange}
                suffix={suffix}
                // extra={extra}
            />
        </FormControl>
    )
}

//     public get tokenWalletAssets(): nt.TokenWalletAsset[] {
//         const { group } = this.connectionStore.selectedConnection
//         const tokenWallets = this.account.additionalAssets[group]?.tokenWallets ?? []
//
//         if (!this.search) return tokenWallets
//
//         const search = this.search.toLowerCase()
//         return tokenWallets.filter(({ rootTokenContract }) => {
//             const symbol = this.knownTokens[rootTokenContract]
//             return symbol?.name.toLowerCase().includes(search)
//                 || symbol?.fullName.toLowerCase().includes(search)
//         })
//     }

// <SlidingPanel active={vm.opened} onClose={vm.handleClose}>
//                 <Container className="amount-input-panel">
//                     <Header>
//                         <h2>{intl.formatMessage({ id: 'SELECT_TOKEN' })}</h2>
//                         <Input
//                             className="amount-input-panel__input"
//                             placeholder={intl.formatMessage({ id: 'TOKEN_SEARCH_PLACEHOLDER' })}
//                             value={vm.search}
//                             onChange={vm.handleSearchChange}
//                         />
//                     </Header>
//                     <Content className="amount-input-panel__content">
//                         <div
//                             className="amount-input-panel__item"
//                             onClick={() => {
//                                 onChangeAsset('')
//                                 vm.handleClose()
//                             }}
//                         >
//                             <EverAssetIcon className="amount-input-panel__item-icon" />
//                             <div className="amount-input-panel__item-wrap">
//                                 <div className="amount-input-panel__item-name">
//                                     {vm.nativeCurrency}
//                                 </div>
//                                 <div className="amount-input-panel__item-fullname">
//                                     {vm.nativeCurrency}
//                                 </div>
//                             </div>
//                             <div className="amount-input-panel__balance">
//                                 {convertEvers(vm.everWalletState?.balance)}
//                             </div>
//                         </div>
//
//                         {vm.tokenWalletAssets.map((value) => {
//                             const symbol = vm.knownTokens[value.rootTokenContract]
//                             const token = vm.tokens[value.rootTokenContract]
//                             const state = vm.tokenWalletStates[value.rootTokenContract]
//                             if (!symbol) return null
//                             return (
//                                 <div
//                                     className="amount-input-panel__item"
//                                     key={symbol.rootTokenContract}
//                                     onClick={() => {
//                                         onChangeAsset(symbol.rootTokenContract)
//                                         vm.handleClose()
//                                     }}
//                                 >
//                                     <AssetIcon
//                                         className="amount-input-panel__item-icon"
//                                         type="token_wallet"
//                                         address={symbol.rootTokenContract}
//                                         old={symbol.version !== 'Tip3'}
//                                     />
//                                     <div className="amount-input-panel__item-wrap">
//                                         <div className="amount-input-panel__item-name">
//                                             {token?.symbol ?? symbol.name}
//                                         </div>
//                                         <div className="amount-input-panel__item-fullname">
//                                             {token?.name ?? symbol.fullName}
//                                         </div>
//                                     </div>
//                                     <div className="amount-input-panel__balance">
//                                         {convertCurrency(state.balance, symbol.decimals)}
//                                     </div>
//                                 </div>
//                             )
//                         })}
//                     </Content>
//                 </Container>
//             </SlidingPanel>

export const AmountInput = observer(forwardRef(AmountInputInternal))
