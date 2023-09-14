/* eslint-disable react/no-unstable-nested-components */
import { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'

import { ErrorMessage, Hint, Icon, Input, Loader } from '@app/popup/modules/shared'

import { useManifestValidator } from '../../hooks'
import { isValidURL } from '../../utils'
import type { NetworkFormValue } from './NetworkFormViewModel'

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
                placeholder={intl.formatMessage({ id: 'NETWORK_TOKEN_LIST_PLACEHOLDER' })}
                suffix={(
                    <>
                        {validating && <Loader />}
                        {!validating
                            && !formState.errors.config?.tokensManifestUrl
                            && watch('config.tokensManifestUrl')
                            && <Icon icon="check" className="form-control__check-icon" />}
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
                <Hint>
                    <FormattedMessage
                        id="NETWORK_TOKEN_LIST_HINT"
                        values={{
                            a: (...parts) => (
                                <a href={GH_LINK} target="_blank" rel="nofollow noopener noreferrer">{parts}</a>
                            ),
                        }}
                    />
                </Hint>
            )}
            {formState.errors.config?.tokensManifestUrl?.type === 'format' && (
                <ErrorMessage>
                    <FormattedMessage
                        id="NETWORK_TOKEN_LIST_ERROR"
                        values={{
                            a: (...parts) => (
                                <a href={GH_LINK} target="_blank" rel="nofollow noopener noreferrer">{parts}</a>
                            ),
                        }}
                    />
                </ErrorMessage>
            )}
        </>
    )
})
