import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'

import { formatCurrency, multiplier, NATIVE_CURRENCY_DECIMALS } from '@app/shared'

import { useResolve } from '../../hooks'
import { TokensStore } from '../../store'

interface Props {
    tokenRoot?: string;
    amount?: string;
    symbol?: 'USD' | '$'
}

export const UsdtPrice = observer(({ tokenRoot, amount, symbol }: Props): JSX.Element | null => {
    const { tokens, prices, everPrice } = useResolve(TokensStore)
    const price = tokenRoot ? prices[tokenRoot] : everPrice
    const decimals = tokenRoot ? tokens[tokenRoot]?.decimals : NATIVE_CURRENCY_DECIMALS

    if (!price || !amount || typeof decimals !== 'number') return null

    const val = formatCurrency(new BigNumber(amount).div(multiplier(decimals)).times(price))

    return (symbol === 'USD' ? `${val} USD` : `$${val}`) as unknown as JSX.Element
})
