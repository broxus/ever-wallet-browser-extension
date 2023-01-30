/* eslint-disable react/no-unstable-nested-components */
import { memo, ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Input } from '@app/popup/modules/shared'
import PlusIcon from '@app/popup/assets/icons/plus.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'

import { isValidURL } from '../../utils'
import { NetworkFormValue } from './NetworkFormValue'

export const Endpoints = memo((): JSX.Element => {
    const intl = useIntl()
    const { register, control, watch } = useFormContext<NetworkFormValue>()
    const { fields, append, remove } = useFieldArray({ control, name: 'endpoints' })
    const type = watch('type')

    return (
        <div className="form-control__inputs">
            {fields.map((field, i) => {
                let suffix: ReactNode | undefined

                if (type === 'graphql' && i === 0) {
                    suffix = (
                        <button
                            type="button"
                            className="form-control__suffix-btn _add"
                            onClick={() => append({ value: '' })}
                        >
                            <PlusIcon />
                        </button>
                    )
                }

                if (type === 'graphql' && i !== 0) {
                    suffix = (
                        <button
                            type="button"
                            className="form-control__suffix-btn _delete"
                            onClick={() => remove(i)}
                        >
                            <DeleteIcon />
                        </button>
                    )
                }

                return (
                    <Input
                        key={field.id}
                        type="text"
                        inputMode="url"
                        size="s"
                        placeholder={intl.formatMessage({ id: 'NETWORK_ENDPOINT_PLACEHOLDER' })}
                        suffix={suffix}
                        {...register(`endpoints.${i}.value`, {
                            required: true,
                            validate: isValidURL,
                        })}
                    />
                )
            })}
        </div>
    )
})
