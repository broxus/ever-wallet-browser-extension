import { ChangeEvent, memo, ReactNode } from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Amount, AmountInput, AssetIcon, Button, Card, FormControl, Input, Space } from '@app/popup/modules/shared'
import { convertCurrency, convertTokenName } from '@app/shared'

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

    return (
        <FormControl>
            <Card className={classNames(styles.amount, { [styles._invalid]: !!error })}>
                <div className={styles.item}>
                    <div className={styles.asset}>
                        <Space direction="column" gap="xxs">
                            <Space direction="row" gap="xs">
                                <AssetIcon
                                    className={styles.icon}
                                    type={rootTokenContract ? 'token_wallet' : 'ever_wallet'}
                                    address={rootTokenContract ?? ''}
                                />
                                {convertTokenName(name)}
                            </Space>
                            <div className={styles.balance}>
                                {intl.formatMessage({ id: 'INPUT_BALANCE' })}&nbsp;
                                <Amount precise value={convertCurrency(balance, decimals)} />
                            </div>
                        </Space>
                        <Button
                            size="s"
                            design="neutral"
                            className={styles.max}
                            onClick={handleMax}
                        >
                            Max
                        </Button>
                    </div>
                </div>

                <div className={styles.item}>
                    <AmountInput
                        value={value}
                        onChange={handleChange}
                        asset={rootTokenContract ? { type: 'token_wallet', data: { rootTokenContract }} : { type: 'ever_wallet', data: { address: rootTokenContract! }}}
                    />
                </div>
            </Card>

            {error}
        </FormControl>
    )


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
                <Amount precise value={convertCurrency(balance, decimals)} currency={name} />
            </div>
            {error}
        </FormControl>
    )
})
