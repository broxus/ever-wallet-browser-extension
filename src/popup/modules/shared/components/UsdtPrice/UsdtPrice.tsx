import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'

import { formatFiat, multiplier } from '@app/shared'

import { useResolve } from '../../hooks'
import { ConnectionStore, TokensStore } from '../../store'

interface Props {
    tokenRoot?: string;
    amount?: string;
    symbol?: 'USD' | '$'
}

export const UsdtPrice = observer(({ tokenRoot, amount, symbol }: Props): JSX.Element | null => {
    const { tokens, prices, everPrice } = useResolve(TokensStore)
    const connectionStore = useResolve(ConnectionStore)
    const price = tokenRoot ? prices[tokenRoot] : everPrice
    const decimals = tokenRoot ? tokens[tokenRoot]?.decimals : connectionStore.decimals

    if (!price || !amount || typeof decimals !== 'number') return null

    const val = formatFiat(new BigNumber(amount).div(multiplier(decimals)).times(price))

    return (symbol === 'USD' ? `${val} USD` : `$${val}`) as unknown as JSX.Element
})
