import { observer } from 'mobx-react-lite'
import { ChangeEvent, ForwardedRef, forwardRef, useCallback, useRef, useState } from 'react'
import classNames from 'classnames'

import type { RawContact } from '@app/models'
import { convertAddress, convertPublicKey, isNativeAddress } from '@app/shared'
import { Button, Icon, Input, InputProps, SlidingPanel, useResolve } from '@app/popup/modules/shared'

import { ContactsStore } from '../../store'
import { ChooseContact } from '../ChooseContact'
import styles from './ContactInput.module.scss'

interface Props {
    type: RawContact['type'];
    value: string;
    className?: string;
    name?: string;
    placeholder?: string;
    autoFocus?: boolean;
    size?: InputProps['size']
    invalid?: InputProps['invalid']
    onChange?(e: ChangeEvent<HTMLInputElement>): void;
    onBlur?(): void;
}

function _ContactInput(props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element {
    const { type, value, className, name, placeholder, autoFocus, size, invalid, onBlur, onChange } = props
    const [opened, setOpened] = useState(false)
    const contactStore = useResolve(ContactsStore)
    const _ref = useRef<HTMLInputElement>()
    const contact = value ? contactStore.contacts[value] : undefined

    const handleClose = useCallback(() => setOpened(false), [])

    const handleOpen = () => setOpened(true)

    const handleRef = (instance: HTMLInputElement) => {
        _ref.current = instance

        if (ref) {
            if (typeof ref === 'function') {
                ref(instance)
            }
            else {
                ref.current = instance
            }
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (contact) return
        onChange?.(e)
    }

    const hanleReset = () => {
        _ref.current?.focus()
        onChange?.({
            target: {
                name: name ?? '',
                value: '',
            },
        } as any)
    }

    const hanleChoose = ({ value }: RawContact) => {
        setOpened(false)
        onChange?.({
            target: {
                name: name ?? '',
                value,
            },
        } as any)
    }

    return (
        <>
            <Input
                size={size}
                invalid={invalid}
                className={classNames(styles.contactInput, className)}
                value={contact ? '' : value}
                prefix={contact ? (
                    <div className={styles.contact}>
                        <div className={styles.name} title={contact.name}>
                            {contact.name}
                        </div>
                        {contact.type === 'address' && (
                            <div className={styles.address} title={contact.value}>
                                ({isNativeAddress(contact.value) ? convertAddress(contact.value) : contact.value})
                            </div>
                        )}
                        {contact.type === 'public_key' && (
                            <div className={styles.address} title={contact.value}>
                                ({convertPublicKey(contact.value)})
                            </div>
                        )}
                    </div>
                ) : null}
                suffix={contact ? (
                    <Button
                        shape="square"
                        size="s"
                        design="neutral"
                        onClick={hanleReset}
                        tabIndex={-1}
                    >
                        <Icon icon="cross" width={16} height={16} />
                    </Button>
                ) : (
                    <Button
                        shape="square"
                        size="s"
                        design="neutral"
                        onClick={handleOpen}
                        tabIndex={-1}
                    >
                        <Icon icon="person" width={16} height={16} />
                    </Button>
                )}
                ref={handleRef}
                autoFocus={autoFocus}
                name={name}
                placeholder={contact ? '' : placeholder} // intl.formatMessage({ id: 'CONTACT_INPUT_PLACEHOLDER' })
                readOnly={!!contact}
                onBlur={onBlur}
                onChange={handleChange}
            />

            <SlidingPanel
                whiteBg
                fullHeight
                active={opened}
                onClose={handleClose}
            >
                <ChooseContact type={type} onChoose={hanleChoose} />
            </SlidingPanel>
        </>
    )
}

export const ContactInput = observer(forwardRef(_ContactInput))
