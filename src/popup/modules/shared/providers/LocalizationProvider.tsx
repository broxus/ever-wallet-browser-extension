import { observer } from 'mobx-react-lite'
import { RawIntlProvider } from 'react-intl'
import { type PropsWithChildren } from 'react'

import { LocalizationStore } from '../store'
import { useResolve } from '../hooks'

type Props = PropsWithChildren<{}>

export const LocalizationProvider = observer(({ children }: Props) => {
    const localizationStore = useResolve(LocalizationStore)

    return (
        <RawIntlProvider value={localizationStore.intl}>
            {children}
        </RawIntlProvider>
    )
})
