import { ForwardedRef, forwardRef, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@app/popup/modules/shared/components/Button'
import { Icon } from '@app/popup/modules/shared/components/Icon'

import { Input, InputProps } from '../Input'
import styles from './PasswordInput.module.scss'


type Props = Omit<InputProps, 'type'>

export const PasswordInput = forwardRef((props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element => {
    const intl = useIntl()
    const [type, setType] = useState<'password' | 'text'>('password')
    const suffix = useMemo(() => (
        <div className={styles.suffix}>
            <Button
                size="s"
                tabIndex={-1}
                design="neutral"
                shape="square"
                onClick={() => setType((value) => (value === 'text' ? 'password' : 'text'))}
            >
                <Icon icon={type === 'text' ? 'eyeOff' : 'eye'} width={16} height={16} />
            </Button>
            {props.suffix}
        </div>
    ), [type, props.suffix])

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
