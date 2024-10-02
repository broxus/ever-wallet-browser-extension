import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Input, useViewModel } from '@app/popup/modules/shared'
import { TokenWalletsToUpdate } from '@app/models'

import { CustomTokenViewModel } from './CustomTokenViewModel'

interface NewToken {
    tokenRoot: string;
}

interface Props {
    loading?: boolean;
    error?: string;
    onSubmit(params: TokenWalletsToUpdate): void;
}

export const CustomToken = memo(({ loading, error, onSubmit }: Props): JSX.Element => {
    const vm = useViewModel(CustomTokenViewModel)
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<NewToken>()

    const submit = useCallback(({ tokenRoot }: NewToken) => {
        onSubmit({
            [tokenRoot]: true,
        })
    }, [onSubmit])

    return (
        <Container>
            <Content>
                <Form id="custom-token" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'ROOT_TOKEN_CONTRACT_FIELD_PLACEHOLDER' })}
                        invalid={!!formState.errors.tokenRoot || !!error}
                    >
                        <Input
                            {...register('tokenRoot', {
                                required: true,
                                pattern: /^(?:-1|0):[0-9a-fA-F]{64}$/,
                                validate: (value: string) => !!value && vm.checkAddress(value),
                            })}
                        />

                        <ErrorMessage>{error}</ErrorMessage>
                        <ErrorMessage>
                            {formState.errors.tokenRoot?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.tokenRoot?.type === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                            {formState.errors.tokenRoot?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                        </ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <Button type="submit" form="custom-token" loading={loading}>
                    {intl.formatMessage({ id: 'PROCEED_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
