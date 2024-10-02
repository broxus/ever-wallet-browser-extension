import RcSelect, { BaseSelectRef, SelectProps } from 'rc-select'
import { forwardRef, Ref } from 'react'

import { Icons } from '@app/popup/icons'

import './Select.scss'

function InternalSelect<T = any>(props: SelectProps<T>, ref: Ref<BaseSelectRef>): JSX.Element {
    return (
        <RcSelect<T>
            ref={ref}
            transitionName="rc-slide-up"
            inputIcon={Icons.chevronDown}
            getPopupContainer={trigger => trigger.closest('.rc-select') || document.body}
            menuItemSelectedIcon={Icons.check}
            {...props}
        />
    )
}

export const Select = forwardRef(InternalSelect) as typeof InternalSelect
