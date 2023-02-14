import { observer } from 'mobx-react-lite'
import { RawIntlProvider } from 'react-intl'
import { PropsWithChildren } from 'react'

import { LocalizationStore } from '../store'
import { useResolve } from '../hooks'

type Props = PropsWithChildren<{}>;

export const LocalizationProvider = observer(({ children }: Props): JSX.Element => {
    const localizationStore = useResolve(LocalizationStore)

    return (
        <RawIntlProvider value={localizationStore.intl}>
            {children}
        </RawIntlProvider>
    )
})
