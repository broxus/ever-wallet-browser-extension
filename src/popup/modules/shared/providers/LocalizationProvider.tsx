import { observer } from 'mobx-react-lite'
import React from 'react'
import { RawIntlProvider } from 'react-intl'

import { LocalizationStore } from '../store'
import { useResolve } from '../hooks'

type Props = React.PropsWithChildren<{}>;

export const LocalizationProvider = observer(({ children }: Props): JSX.Element => {
    const localizationStore = useResolve(LocalizationStore)

    return (
        <RawIntlProvider value={localizationStore.intl}>
            {children}
        </RawIntlProvider>
    )
})
