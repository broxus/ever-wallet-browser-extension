import { ForwardedRef, forwardRef, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'

import { Input, InputProps } from '../Input'
import styles from './PasswordInput.module.scss'

type Props = Omit<InputProps, 'type'>

export const PasswordInput = forwardRef((props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element => {
    const intl = useIntl()
    const [type, setType] = useState<'password' | 'text'>('password')
    const suffix = useMemo(() => (
        <div className={styles.suffix}>
            <button
                type="button"
                className={styles.btn}
                tabIndex={-1}
                onClick={() => setType((value) => (value === 'text' ? 'password' : 'text'))}
            >
                {type === 'text' ? Icons.eyeOff : Icons.eye}
            </button>
            {props.suffix}
        </div>
    ), [type])

    return (
        <Input
            {...props}
            ref={ref}
            type={type}
            suffix={suffix}
            placeholder={props.placeholder ?? intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
        />
    )
})
