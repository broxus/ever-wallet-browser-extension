import { memo } from 'react'
import { useIntl } from 'react-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Input } from '@app/popup/modules/shared'

import { isValidURL } from '../../utils'
import type { NetworkFormValue } from './NetworkFormViewModel'

export const Endpoints = memo(() => {
    const intl = useIntl()
    const { register, control } = useFormContext<NetworkFormValue>()
    const { fields } = useFieldArray({ control, name: 'endpoints' })

    return (
        <div className="form-control__inputs">
            {fields.map((field, i) => (
                <Input
                    key={field.id}
                    size="xs"
                    type="text"
                    inputMode="url"
                    placeholder={intl.formatMessage({ id: 'NETWORK_ENDPOINT_PLACEHOLDER' })}
                    {...register(`endpoints.${i}.value`, {
                        required: true,
                        validate: isValidURL,
                    })}
                />
            ))}
        </div>
    )
})
