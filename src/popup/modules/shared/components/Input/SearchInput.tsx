import { forwardRef } from 'react'
import { useIntl } from 'react-intl'

import SearchIcon from '@app/popup/assets/icons/search.svg'

import { Input, InputProps } from './Input'

type Props = Omit<InputProps, 'prefix' | 'type'>

const searchIcon = <SearchIcon />

export const SearchInput = forwardRef<HTMLInputElement, Props>(({ placeholder, ...props }, ref): JSX.Element => {
    const intl = useIntl()

    return (
        <Input
            {...props}
            type="search"
            ref={ref}
            prefix={searchIcon}
            placeholder={placeholder ?? intl.formatMessage({ id: 'SEARCH_INPUT_DEFAULT_PLACEHOLDER' })}
        />
    )
})
