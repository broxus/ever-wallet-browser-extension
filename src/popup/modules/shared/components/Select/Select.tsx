import RcSelect, { BaseSelectRef, SelectProps } from 'rc-select'
import { forwardRef } from 'react'
import * as React from 'react'

import ArrowDown from '@app/popup/assets/img/arrow-down.svg'

import './Select.scss'

function InternalSelect<T = any>(props: SelectProps<T>, ref: React.Ref<BaseSelectRef>): JSX.Element {
    return (
        <RcSelect<T>
            ref={ref}
            transitionName="rc-slide-up"
            inputIcon={<img src={ArrowDown} alt="More" />}
            getPopupContainer={trigger => trigger.closest('.rc-select') || document.body}
            {...props}
        />
    )
}

export const Select = forwardRef(InternalSelect) as typeof InternalSelect
