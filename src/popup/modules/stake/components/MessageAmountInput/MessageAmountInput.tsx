import { ChangeEvent, memo, ReactNode } from 'react'
import { useIntl } from 'react-intl'

import { Amount, AssetIcon, FormControl, Input } from '@app/popup/modules/shared'
import { convertCurrency, convertTokenName, formatCurrency } from '@app/shared'

import styles from './MessageAmountInput.module.scss'

interface Props {
    value: string
    balance: string
    name: string
    decimals: number
    maxAmount: string
    rootTokenContract?: string
    error?: ReactNode
    onChange: (value: string) => void
}

export const MessageAmountInput = memo((props: Props): JSX.Element => {
    const { value, balance, name, decimals, maxAmount, rootTokenContract, error, onChange } = props
    const intl = useIntl()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value.trim())
    const handleMax = () => onChange(convertCurrency(maxAmount, decimals))
    const formattedBalance = formatCurrency(convertCurrency(balance, decimals))

    return (
        <FormControl
            label={(
                <div className={styles.asset}>
                    <AssetIcon
                        className={styles.icon}
                        type={rootTokenContract ? 'token_wallet' : 'ever_wallet'}
                        address={rootTokenContract ?? ''}
                    />
                    {convertTokenName(name)}
                </div>
            )}
            invalid={!!error}
        >
            <Input
                autoFocus
                className="message-amount-input"
                type="text"
                name="amount"
                placeholder="0.0"
                value={value}
                onChange={handleChange}
                suffix={(
                    <button className={styles.suffix} type="button" onClick={handleMax}>
                        Max
                    </button>
                )}
            />
            <div className={styles.balance}>
                {intl.formatMessage({ id: 'INPUT_BALANCE' })}
                &nbsp;
                <Amount value={formattedBalance} currency={name} />
            </div>
            {error}
        </FormControl>
    )
})
