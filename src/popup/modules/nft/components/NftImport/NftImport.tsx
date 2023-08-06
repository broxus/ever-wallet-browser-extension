import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Input, Navbar, useViewModel } from '@app/popup/modules/shared'

import { ImportFormData, NftImportViewModel } from './NftImportViewModel'
import styles from './NftImport.module.scss'

export const NftImport = observer((): JSX.Element => {
    const form = useForm<ImportFormData>()
    const vm = useViewModel(NftImportViewModel, (model) => {
        model.form = form
    })
    const intl = useIntl()
    const { register, handleSubmit, formState } = form

    return (
        <Container>
            <Header>
                <Navbar back="/dashboard/nft" />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'NFT_IMPORT_HEADER' })}</h2>
                <p className={styles.hint}>
                    {intl.formatMessage({ id: 'NFT_IMPORT_ADDRESS_HINT' })}
                </p>
                <Form id="import" className={styles.form} onSubmit={handleSubmit(vm.submitManual)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'NFT_IMPORT_ADDRESS_INPUT_PLACEHOLDER' })}
                        invalid={!!formState.errors.address}
                    >
                        <Input
                            type="text"
                            {...register('address', {
                                required: true,
                                validate: vm.validateAddress,
                            })}
                        />

                        <ErrorMessage>
                            {formState.errors.address?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.address?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                            {formState.errors.address?.type === 'notfound' && intl.formatMessage({ id: 'ERROR_NFT_NOT_FOUND' })}
                            {formState.errors.address?.type === 'notowner' && intl.formatMessage({ id: 'ERROR_NFT_NOT_OWNER' })}
                        </ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <Button type="submit" form="import" loading={vm.loading}>
                    {intl.formatMessage({ id: 'NFT_IMPORT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
