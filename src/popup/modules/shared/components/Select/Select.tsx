import RcSelect, { BaseSelectRef, SelectProps } from 'rc-select'
import { forwardRef, Ref } from 'react'

import ChevronIcon from '@app/popup/assets/icons/chevron-down.svg'

import './Select.scss'

const chevron = <ChevronIcon />

function InternalSelect<T = any>(props: SelectProps<T>, ref: Ref<BaseSelectRef>): JSX.Element {
    return (
        <RcSelect<T>
            ref={ref}
            transitionName="rc-slide-up"
            inputIcon={chevron}
            getPopupContainer={trigger => trigger.closest('.rc-select') || document.body}
            {...props}
        />
    )
}

export const Select = forwardRef(InternalSelect) as typeof InternalSelect
