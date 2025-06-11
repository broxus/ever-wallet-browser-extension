import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { Button, Card, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Hint, Input, Navbar, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { Page } from '@app/popup/modules/shared/components/Page'
import { usePage } from '@app/popup/modules/shared/hooks/usePage'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { ImportFormData, NftImportViewModel } from './NftImportViewModel'
import styles from './NftImport.module.scss'

export const NftImport = observer((): JSX.Element => {
    const page = usePage()
    const navigate = useNavigate()
    const form = useForm<ImportFormData>()
    const vm = useViewModel(NftImportViewModel, (model) => {
        model.form = form
    })
    const intl = useIntl()
    const { handleSubmit, formState, control } = form

    const onBack = page.close(() => navigate(-1))

    return (
        <Page
            animated id="nft-add-page" page={page}
            className={styles.page}
        >
            <Container className={styles.container}>
                <Header className={styles.header}>
                    <Navbar back={onBack}>
                        {intl.formatMessage({ id: 'NFT_IMPORT_HEADER' })}
                    </Navbar>
                </Header>

                <Content>
                    <Card
                        size="s" bg="layer-1" padding="xs"
                        className={styles.user}
                    >
                        <UserInfo account={vm.account!} />
                    </Card>
                    <Form id="import" className={styles.form} onSubmit={handleSubmit((data) => vm.submitManual(data, onBack))}>
                        <FormControl
                            invalid={!!formState.errors.address}
                        >
                            <Controller
                                name="address"
                                control={control}
                                rules={{ required: true, validate: vm.validateAddress }}
                                render={({ field }) => (
                                    <Input
                                        placeholder={intl.formatMessage({ id: 'NFT_INPUT_PASTE_TEXT' })}
                                        showReset
                                        size="xs"
                                        type="text"
                                        {...field}
                                    />
                                )}
                            />

                            <ErrorMessage>
                                {formState.errors.address?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                {formState.errors.address?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                                {formState.errors.address?.type === 'notfound' && intl.formatMessage({ id: 'ERROR_NFT_NOT_FOUND' })}
                                {formState.errors.address?.type === 'notowner' && intl.formatMessage({ id: 'ERROR_NFT_NOT_OWNER' })}
                            </ErrorMessage>
                            <Hint>
                                {intl.formatMessage({ id: 'NFT_INPUT_HELPER_TEXT' })}
                            </Hint>
                        </FormControl>
                    </Form>
                </Content>

                <Footer layer>
                    <FooterAction>
                        <Button type="submit" form="import" loading={vm.loading}>
                            {intl.formatMessage({ id: 'IMPORT_BTN_TEXT' })}
                        </Button>
                    </FooterAction>

                </Footer>
            </Container>
        </Page>
    )
})
