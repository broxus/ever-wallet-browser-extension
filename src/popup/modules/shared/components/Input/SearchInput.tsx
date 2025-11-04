import { useIntl } from 'react-intl'

import { Input, InputProps } from './Input'

type Props = Omit<InputProps, 'prefix' | 'type'>

export const SearchInput = ({ placeholder, ...props } : Props) => {
    const intl = useIntl()

    return (
        <Input
            {...props}
            showReset
            type="search"
            placeholder={placeholder ?? intl.formatMessage({ id: 'SEARCH_INPUT_DEFAULT_PLACEHOLDER' })}
        />
    )
}
