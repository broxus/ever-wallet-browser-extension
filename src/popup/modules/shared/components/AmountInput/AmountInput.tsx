import { ForwardedRef, forwardRef, InputHTMLAttributes } from 'react'
import { observer } from 'mobx-react-lite'

import { SelectedAsset, tryParseCurrency } from '@app/shared'

import { useViewModel } from '../../hooks'
import { Input } from '../Input'
import { UsdtPrice } from '../UsdtPrice'
import { AmountInputViewModel } from './AmountInputViewModel'
import styles from './AmountInput.module.scss'

type Keys = 'className' | 'autoFocus' | 'name' | 'onChange' | 'onBlur'
type Props = Pick<InputHTMLAttributes<HTMLInputElement>, Keys> & {
    value: string;
    asset: SelectedAsset;
}

function AmountInputInternal(props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element {
    const { value, className, name, asset, onChange, ...rest } = props
    const vm = useViewModel(AmountInputViewModel, (model) => {
        model.asset = asset
    }, [asset])

    return (
        <div className={className}>
            <Input
                {...rest}
                type="text"
                inputMode="decimal"
                placeholder="0"
                className={styles.input}
                ref={ref}
                value={value}
                name={name}
                onChange={onChange}
            />
            <div className={styles.balance}>
                <UsdtPrice amount={tryParseCurrency(value, vm.decimals)} />
            </div>
        </div>
    )
}

export const AmountInput = observer(forwardRef(AmountInputInternal))
