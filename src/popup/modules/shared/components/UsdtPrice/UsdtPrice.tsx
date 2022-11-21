import Decimal from 'decimal.js'
import { observer } from 'mobx-react-lite'

import { formatCurrency, multiplier, NATIVE_CURRENCY_DECIMALS } from '@app/shared'

import { useResolve } from '../../hooks'
import { TokensStore } from '../../store'

interface Props {
    tokenRoot?: string;
    amount?: string;
}

export const UsdtPrice = observer(({ tokenRoot, amount }: Props): JSX.Element | null => {
    const { meta, prices, everPrice } = useResolve(TokensStore)
    const price = tokenRoot ? prices[tokenRoot] : everPrice
    const decimals = tokenRoot ? meta[tokenRoot]?.decimals : NATIVE_CURRENCY_DECIMALS

    if (!price || !amount || typeof decimals !== 'number') return null

    return `$${formatCurrency(
        Decimal.mul(Decimal.div(amount, multiplier(decimals)), price),
    )}` as unknown as JSX.Element
})
