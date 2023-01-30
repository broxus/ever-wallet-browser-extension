/* eslint-disable react/no-unstable-nested-components */
import { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'

import { Input, Spinner } from '@app/popup/modules/shared'
import CheckIcon from '@app/popup/assets/icons/check.svg'

import { useManifestValidator } from '../../hooks'
import { isValidURL } from '../../utils'
import { NetworkFormValue } from './NetworkFormValue'

const GH_LINK = 'https://github.com/broxus/ton-assets/blob/master/schemas/manifest.json'

export const TokenManifestInput = memo((): JSX.Element => {
    const intl = useIntl()
    const { validate, validating } = useManifestValidator()
    const { register, formState, watch } = useFormContext<NetworkFormValue>()

    return (
        <>
            <Input
                type="text"
                inputMode="url"
                size="s"
                placeholder={intl.formatMessage({ id: 'NETWORK_TOKEN_LIST_PLACEHOLDER' })}
                suffix={(
                    <>
                        {validating && <Spinner />}
                        {!validating
                            && !formState.errors.config?.tokensManifestUrl
                            && watch('config.tokensManifestUrl')
                            && <CheckIcon className="form-control__check-icon" />}
                    </>
                )}
                {...register('config.tokensManifestUrl', {
                    required: false,
                    validate: {
                        url: isValidURL,
                        format: validate,
                    },
                })}
            />
            {formState.errors.config?.tokensManifestUrl?.type !== 'format' && (
                <span className="form-control__hint">
                    <FormattedMessage
                        id="NETWORK_TOKEN_LIST_HINT"
                        values={{
                            a: (...parts) => (
                                <a href={GH_LINK} target="_blank" rel="nofollow noopener noreferrer">{parts}</a>
                            ),
                        }}
                    />
                </span>
            )}
            {formState.errors.config?.tokensManifestUrl?.type === 'format' && (
                <span className="form-control__hint _error">
                    <FormattedMessage
                        id="NETWORK_TOKEN_LIST_ERROR"
                        values={{
                            a: (...parts) => (
                                <a href={GH_LINK} target="_blank" rel="nofollow noopener noreferrer">{parts}</a>
                            ),
                        }}
                    />
                </span>
            )}
        </>
    )
})
