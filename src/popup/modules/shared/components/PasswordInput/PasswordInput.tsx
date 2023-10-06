import { ForwardedRef, forwardRef, useMemo, useState } from 'react'

import { Icons } from '@app/popup/icons'

import { Input, InputProps } from '../Input'
import styles from './PasswordInput.module.scss'

type Props = Omit<InputProps, 'suffix' | 'type'>

export const PasswordInput = forwardRef((props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element => {
    const [type, setType] = useState<'password' | 'text'>('password')
    const suffix = useMemo(() => (
        <button
            type="button"
            className={styles.suffix}
            tabIndex={-1}
            onClick={() => setType((value) => (value === 'text' ? 'password' : 'text'))}
        >
            {type === 'text' ? Icons.eyeOff : Icons.eye}
        </button>
    ), [type])

    return (
        <Input
            ref={ref}
            type={type}
            suffix={suffix}
            {...props}
        />
    )
})
