import RcSelect, { type SelectProps } from 'rc-select'

import { Icons } from '@app/popup/icons'

import './Select.scss'

type Props = {
    size?: 's'
}

export function Select<T = any>(props: SelectProps<T> & Props) {
    const { size } = props

    return (
        <RcSelect<T>
            transitionName="rc-slide-up"
            suffixIcon={Icons.chevronDown}
            getPopupContainer={trigger => trigger.closest('.rc-select') || document.body}
            menuItemSelectedIcon={Icons.check}
            className={size}
            {...props}
        />
    )
}
