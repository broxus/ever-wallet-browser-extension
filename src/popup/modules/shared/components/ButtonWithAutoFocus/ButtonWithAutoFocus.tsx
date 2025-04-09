import { useEffect, useRef } from 'react'

import { Button, ButtonProps } from '../Button/Button'

export const ButtonWithAutoFocus = (props: ButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        ref.current?.focus()
    }, [])

    return <Button ref={ref} {...props} />
}
