import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Hint, Input, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { convertPublicKey } from '@app/shared'

import { FormValue, RenameCustodianViewModel } from './RenameCustodianViewModel'

interface Props {
    publicKey: string;
}

export const RenameCustodian = observer(({ publicKey }: Props): JSX.Element | null => {
    const vm = useViewModel(RenameCustodianViewModel, (model) => {
        model.publicKey = publicKey
    }, [publicKey])
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        mode: 'onSubmit',
        reValidateMode: 'onBlur',
        defaultValues: {
            name: vm.name,
        },
    })

    return (
        <Container>
            <Content>
                <Form id="rename-custodian" onSubmit={handleSubmit(vm.submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CHANGE_ACCOUNT_NAME_INPUT_LABEL' })}
                        invalid={!!formState.errors.name}
                    >
                        <Input
                            autoFocus
                            {...register('name', {
                                required: true,
                                maxLength: 64,
                            })}
                        />
                        <Hint>
                            {intl.formatMessage({ id: 'PUBLIC_KEY_LABEL' })}
                            &nbsp;
                            {convertPublicKey(publicKey)}
                        </Hint>
                        <ErrorMessage>
                            {formState.errors.name?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.name?.type === 'maxLength' && intl.formatMessage({ id: 'ERROR_MAX_LENGTH' })}
                        </ErrorMessage>
                        <ErrorMessage>
                            {vm.error}
                        </ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <FooterAction
                    buttons={[
                        <Button design="neutral" onClick={vm.handle.close}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>,
                        <Button
                            design="accent" type="submit" form="rename-custodian"
                            loading={vm.loading}
                        >
                            {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
