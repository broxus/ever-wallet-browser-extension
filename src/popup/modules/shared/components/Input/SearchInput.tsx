import { forwardRef } from 'react'
import { useIntl } from 'react-intl'

import { Input, InputProps } from './Input'

type Props = Omit<InputProps, 'prefix' | 'type'>

export const SearchInput = forwardRef<HTMLInputElement, Props>(({ placeholder, ...props }, ref): JSX.Element => {
    const intl = useIntl()

    return (
        <Input
            {...props}
            showReset
            type="search"
            ref={ref}
            placeholder={placeholder ?? intl.formatMessage({ id: 'SEARCH_INPUT_DEFAULT_PLACEHOLDER' })}
        />
    )
})
