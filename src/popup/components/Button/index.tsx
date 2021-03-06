import React from 'react'
import cn from 'classnames'
import { createRipple, removeRipple } from '@popup/common'

import './style.scss'

type IButton = {
    text: string | JSX.Element
    type?: 'button' | 'submit' | 'reset' | undefined
    form?: string
    className?: string
    white?: boolean
    onClick?: () => void
    disabled?: boolean
    noBorder?: boolean
}

const Button: React.FC<IButton> = ({
    text,
    white,
    disabled,
    noBorder,
    onClick,
    type = 'button',
    form,
    className = '',
}) => {
    let styles = cn('button', className, {
        noselect: true,
        _white: white,
        _blue: !white,
        _disabled: disabled,
        _noborder: noBorder,
    })

    return (
        <>
            <button
                type={type}
                form={form}
                disabled={disabled}
                className={styles}
                onClick={() => {}}
                onMouseDown={(e) => {
                    createRipple(e)
                }}
                onMouseLeave={(e) => {
                    removeRipple(e)
                }}
                onMouseUp={(event) => {
                    removeRipple(event)
                    onClick?.()
                }}
            >
                <div className="button__content">{text}</div>
            </button>
        </>
    )
}

export default Button
