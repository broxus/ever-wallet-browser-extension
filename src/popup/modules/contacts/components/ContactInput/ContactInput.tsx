import { observer } from 'mobx-react-lite'
import { ChangeEvent, ForwardedRef, forwardRef, useCallback, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import CrossIcon from '@app/popup/assets/icons/cross.svg'
import ProfileIcon from '@app/popup/assets/icons/profile.svg'
import { convertAddress, isNativeAddress } from '@app/shared'
import { Input, SlidingPanel, useResolve } from '@app/popup/modules/shared'

import { ContactsStore } from '../../store'
import { ChooseContact } from '../ChooseContact'

import './ContactInput.scss'

interface Props {
    value: string;
    className?: string;
    name?: string;
    placeholder?: string;
    autoFocus?: boolean;
    size?: 's' | 'm';
    onChange?(e: ChangeEvent<HTMLInputElement>): void;
    onBlur?(): void;
}

function _ContactInput(props: Props, ref: ForwardedRef<HTMLInputElement>): JSX.Element {
    const { value, className, name, placeholder, autoFocus, size, onBlur, onChange } = props
    const [opened, setOpened] = useState(false)
    const contactStore = useResolve(ContactsStore)
    const intl = useIntl()
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

    const hanleChoose = (address: string) => {
        setOpened(false)
        onChange?.({
            target: {
                name: name ?? '',
                value: address,
            },
        } as any)
    }

    return (
        <>
            <Input
                className={classNames('contact-input', className)}
                value={contact ? '' : value}
                prefix={contact ? (
                    <div className="contact-input__prefix-contact">
                        <div className="contact-input__prefix-contact-name" title={contact.name}>
                            {contact.name}
                        </div>
                        <div className="contact-input__prefix-contact-address" title={contact.address}>
                            ({isNativeAddress(contact.address) ? convertAddress(contact.address) : contact.address})
                        </div>
                    </div>
                ) : null}
                suffix={contact ? (
                    <button type="button" className="contact-input__suffix-reset" onClick={hanleReset}>
                        <CrossIcon />
                    </button>
                ) : (
                    <button type="button" className="contact-input__suffix-contacts" onClick={handleOpen}>
                        <ProfileIcon />
                    </button>
                )}
                ref={handleRef}
                autoFocus={autoFocus}
                size={size}
                name={name}
                placeholder={contact ? '' : (placeholder ?? intl.formatMessage({ id: 'CONTACT_INPUT_PLACEHOLDER' }))}
                readOnly={!!contact}
                onBlur={onBlur}
                onChange={handleChange}
            />

            <SlidingPanel fullHeight active={opened} onClose={handleClose}>
                <ChooseContact onChoose={hanleChoose} />
            </SlidingPanel>
        </>
    )
}

export const ContactInput = observer(forwardRef(_ContactInput))
