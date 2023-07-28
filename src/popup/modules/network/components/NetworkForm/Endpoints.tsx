/* eslint-disable react/no-unstable-nested-components */
import { memo } from 'react'
import { useIntl } from 'react-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button, IconButton, Input } from '@app/popup/modules/shared'
import PlusIcon from '@app/popup/assets/icons/plus.svg'
import MinusIcon from '@app/popup/assets/icons/minus.svg'

import { isValidURL } from '../../utils'
import type { NetworkFormValue } from './NetworkFormViewModel'

export const Endpoints = memo((): JSX.Element => {
    const intl = useIntl()
    const { register, control, watch } = useFormContext<NetworkFormValue>()
    const { fields, append, remove } = useFieldArray({ control, name: 'endpoints' })
    const type = watch('type')

    return (
        <div className="form-control__inputs">
            {fields.map((field, i) => (
                <div className="form-control__input" key={field.id}>
                    <Input
                        type="text"
                        inputMode="url"
                        placeholder={intl.formatMessage({ id: 'NETWORK_ENDPOINT_PLACEHOLDER' })}
                        {...register(`endpoints.${i}.value`, {
                            required: true,
                            validate: isValidURL,
                        })}
                    />

                    {type === 'graphql' && i !== 0 && (
                        <IconButton
                            size="s"
                            className="form-control__input-btn"
                            icon={<MinusIcon />}
                            onClick={() => remove(i)}
                        />
                    )}
                </div>
            ))}

            {type === 'graphql' && (
                <Button size="m" design="ghost" onClick={() => append({ value: '' })}>
                    <PlusIcon />
                    {intl.formatMessage({ id: 'NETWORK_ENDPOINT_ADD' })}
                </Button>
            )}
        </div>
    )
})
