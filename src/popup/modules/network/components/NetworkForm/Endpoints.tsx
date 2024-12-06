import { memo } from 'react'
import { useIntl } from 'react-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button, Icon, Input } from '@app/popup/modules/shared'

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
                <Input
                    key={field.id}
                    size="xs"
                    type="text"
                    inputMode="url"
                    placeholder={intl.formatMessage({ id: 'NETWORK_ENDPOINT_PLACEHOLDER' })}
                    suffix={type === 'graphql' && i === 0 ? (
                        <Button
                            shape="square"
                            size="s"
                            design="neutral"
                            onClick={() => append({ value: '' })}
                            tabIndex={-1}
                        >
                            <Icon icon="plus" width={16} height={16} />
                        </Button>
                    ) : type === 'graphql' && i !== 0 ? (
                        <Button
                            shape="square"
                            size="s"
                            design="neutral"
                            onClick={() => remove(i)}
                            tabIndex={-1}
                        >
                            <Icon icon="cross" width={16} height={16} />
                        </Button>
                    ) : null}
                    {...register(`endpoints.${i}.value`, {
                        required: true,
                        validate: isValidURL,
                    })}
                />
            ))}
        </div>
    )
})
