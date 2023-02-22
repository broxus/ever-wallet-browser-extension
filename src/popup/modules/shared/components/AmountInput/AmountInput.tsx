import type nt from '@broxus/ever-wallet-wasm'
import { ForwardedRef, forwardRef, InputHTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'
import Decimal from 'decimal.js'

import { convertCurrency, convertEvers, convertTokenName, formatCurrency, tryParseCurrency } from '@app/shared'

import { useViewModel } from '../../hooks'
import { Input } from '../Input'
import { AssetIcon, EverAssetIcon } from '../AssetIcon'
import { UsdtPrice } from '../UsdtPrice'
import { SlidingPanel } from '../SlidingPanel'
import { Container, Content, Header } from '../layout'
import { AmountInputViewModel } from './AmountInputViewModel'

import './AmountInput.scss'

type Keys = 'className' | 'autoFocus' | 'name' | 'onChange' | 'onBlur'
type Props = Pick<InputHTMLAttributes<HTMLInputElement>, Keys> & {
    value: string;
    account: nt.AssetsList;
    asset: string;
    onChangeAsset(value: string): void
}

function AmountInputInternal(props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element {
    const { value, className, name, account, asset, onChangeAsset, onChange, ...rest } = props
    const vm = useViewModel(AmountInputViewModel, (model) => {
        model.account = account
        model.asset = asset
    }, [account, asset])
    const intl = useIntl()

    const handleMax = () => {
        let value = convertCurrency(vm.balance, vm.decimals)

        if (!asset) { // native currency
            value = Decimal.max(0, Decimal.sub(value, '0.1')).toFixed()
        }

        onChange?.({
            target: {
                value,
                name: name ?? '',
            },
        } as any)
    }

    const suffix = (
        <button className="amount-input__token" type="button" onClick={vm.handleOpen}>
            <AssetIcon
                className="amount-input__token-icon"
                type={asset ? 'token_wallet' : 'ever_wallet'}
                address={asset ?? ''}
            />
            {convertTokenName(vm.currencyName)}
        </button>
    )

    const extra = (
        <div className="amount-input__extra">
            <div className="extra__price">
                <UsdtPrice
                    amount={tryParseCurrency(value || '0', vm.decimals)}
                    tokenRoot={asset}
                />
            </div>
            <button className="extra__btn" type="button" onClick={handleMax}>
                max
            </button>
            <div className="extra__balance">
                {intl.formatMessage({ id: 'INPUT_BALANCE' })}
                &nbsp;
                {formatCurrency(convertCurrency(vm.balance, vm.decimals))}
            </div>
        </div>
    )

    return (
        <>
            <Input
                {...rest}
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                className={classNames('amount-input', className)}
                ref={ref}
                value={value}
                name={name}
                onChange={onChange}
                suffix={suffix}
                extra={extra}
            />

            <SlidingPanel active={vm.opened} onClose={vm.handleClose}>
                <Container className="amount-input-panel">
                    <Header>
                        <h2>{intl.formatMessage({ id: 'SELECT_TOKEN' })}</h2>
                        <Input
                            className="amount-input-panel__input"
                            size="s"
                            placeholder={intl.formatMessage({ id: 'TOKEN_SEARCH_PLACEHOLDER' })}
                            value={vm.search}
                            onChange={vm.handleSearchChange}
                        />
                    </Header>
                    <Content className="amount-input-panel__content">
                        <div
                            className="amount-input-panel__item"
                            onClick={() => {
                                onChangeAsset('')
                                vm.handleClose()
                            }}
                        >
                            <EverAssetIcon className="amount-input-panel__item-icon" />
                            <div className="amount-input-panel__item-wrap">
                                <div className="amount-input-panel__item-name">
                                    {vm.nativeCurrency}
                                </div>
                                <div className="amount-input-panel__item-fullname">
                                    {vm.nativeCurrency}
                                </div>
                            </div>
                            <div className="amount-input-panel__balance">
                                {convertEvers(vm.everWalletState?.balance)}
                            </div>
                        </div>

                        {vm.tokenWalletAssets.map((value) => {
                            const symbol = vm.knownTokens[value.rootTokenContract]
                            const state = vm.tokenWalletStates[value.rootTokenContract]
                            if (!symbol) return null
                            return (
                                <div
                                    className="amount-input-panel__item"
                                    key={symbol.rootTokenContract}
                                    onClick={() => {
                                        onChangeAsset(symbol.rootTokenContract)
                                        vm.handleClose()
                                    }}
                                >
                                    <AssetIcon
                                        className="amount-input-panel__item-icon"
                                        type="token_wallet"
                                        address={symbol.rootTokenContract}
                                        old={symbol.version !== 'Tip3'}
                                    />
                                    <div className="amount-input-panel__item-wrap">
                                        <div className="amount-input-panel__item-name">
                                            {symbol.name}
                                        </div>
                                        <div className="amount-input-panel__item-fullname">
                                            {symbol.fullName}
                                        </div>
                                    </div>
                                    <div className="amount-input-panel__balance">
                                        {convertCurrency(state.balance, symbol.decimals)}
                                    </div>
                                </div>
                            )
                        })}
                    </Content>
                </Container>
            </SlidingPanel>
        </>
    )
}

export const AmountInput = observer(forwardRef(AmountInputInternal))
