import { ForwardedRef, forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { useIntl } from 'react-intl'
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
    address: string;
    asset: SelectedAsset;
    invalid?: boolean;
    error?: ReactNode;
}

function AmountInputInternal(props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element {
    const { value, className, name, address, asset, invalid, error, onChange, ...rest } = props
    const vm = useViewModel(AmountInputViewModel, (model) => {
        model.address = address
        model.asset = asset
    }, [address, asset])
    const intl = useIntl()

    const handleMax = () => {
        let value = convertCurrency(vm.balance, vm.decimals)

        if (asset.type === 'ever_wallet') { // native currency
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

    return (
        <FormControl label={intl.formatMessage({ id: 'AMOUNT_INPUT_LABEL' })} invalid={invalid} className={className}>
            <Input
                {...rest}
                type="text"
                inputMode="decimal"
                ref={ref}
                value={value}
                name={name}
                onChange={onChange}
                suffix={suffix}
            />
            <div className={styles.balance}>
                {intl.formatMessage({ id: 'INPUT_BALANCE' })}
                &nbsp;
                <Amount value={convertCurrency(vm.balance, vm.decimals)} currency={vm.currencyName} />
            </div>
            {error}
        </FormControl>
    )
}

export const AmountInput = observer(forwardRef(AmountInputInternal))
