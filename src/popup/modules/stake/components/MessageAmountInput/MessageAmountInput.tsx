import { ChangeEvent, memo } from 'react'
import { useIntl } from 'react-intl'

import { AssetIcon, Input } from '@app/popup/modules/shared'
import { convertCurrency, convertTokenName, formatCurrency } from '@app/shared'

import './MessageAmountInput.scss'

interface Props {
    value: string
    balance: string
    name: string
    decimals: number
    maxAmount: string
    rootTokenContract?: string
    onChange: (value: string) => void
}

export const MessageAmountInput = memo((props: Props): JSX.Element => {
    const { value, balance, name, decimals, maxAmount, rootTokenContract, onChange } = props
    const intl = useIntl()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value.trim())
    const handleMax = () => onChange(convertCurrency(maxAmount, decimals))

    return (
        <Input
            autoFocus
            className="message-amount-input"
            type="text"
            name="amount"
            placeholder="0.0"
            value={value}
            onChange={handleChange}
            suffix={(
                <div className="message-amount-input__token noselect">
                    <AssetIcon
                        className="root-token-icon"
                        type={rootTokenContract ? 'token_wallet' : 'ever_wallet'}
                        address={rootTokenContract ?? ''}
                    />
                    {convertTokenName(name)}
                </div>
            )}
            extra={(
                <div className="message-amount-input__extra">
                    {/*<div className="extra__price">
                        $0 // TODO
                    </div>*/}
                    <button className="extra__btn" type="button" onClick={handleMax}>
                        max
                    </button>
                    <div className="extra__balance">
                        {intl.formatMessage({ id: 'STAKE_INPUT_BALANCE' })}
                        &nbsp;
                        {formatCurrency(convertCurrency(balance, decimals))}
                    </div>
                </div>
            )}
        />
    )
})
