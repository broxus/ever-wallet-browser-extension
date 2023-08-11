import { forwardRef, InputHTMLAttributes, useRef } from 'react'

import { Icons } from '@app/popup/icons'

import { IconButton } from '../IconButton'
import { Input } from '../Input'
import styles from './CheckSeedInput.module.scss'

type Props = InputHTMLAttributes<HTMLInputElement> & {
    number: number;
    reset(): void;
}

export const CheckSeedInput = forwardRef<HTMLInputElement, Props>(({ number, reset, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const handleRef = (instance: HTMLInputElement | null) => {
        if (typeof ref === 'function') ref(instance)
        else if (ref) ref.current = instance
        inputRef.current = instance
    }
    const handleClick = () => {
        reset()
        inputRef.current?.focus()
    }

    return (
        <Input
            {...props}
            required
            size="s"
            ref={handleRef}
            className={styles.input}
            prefix={<div className={styles.prefix}>{number}</div>}
            suffix={(
                <IconButton
                    design="ghost"
                    size="xs"
                    icon={Icons.delete}
                    className={styles.suffix}
                    onClick={handleClick}
                />
            )}
        />
    )
})
