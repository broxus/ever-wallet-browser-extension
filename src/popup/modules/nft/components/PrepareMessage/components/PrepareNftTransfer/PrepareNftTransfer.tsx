import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import {
    Button,
    Card,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Form,
    FormControl,
    Header,
    Navbar,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'

import { NftItem } from '../../../NftItem'
import { FormData, PrepareNftTransferViewModel } from './PrepareNftTransferViewModel'
import styles from './PrepareNftTransfer.module.scss'

export const PrepareNftTransfer = observer((): JSX.Element => {
    const vm = useViewModel(PrepareNftTransferViewModel, (model) => {
        model.setFormError = (...args) => setError(...args)
    })
    const intl = useIntl()
    const { handleSubmit, formState, control, setError } = useForm<FormData>({
        defaultValues: { recipient: vm.transfer.messageParams?.recipient ?? '' },
    })

    return (
        <Container>
            <Header>
                <Navbar close="window" />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'NFT_TRANSFER_HEADER' })}</h2>
                <div className={styles.text}>
                    {intl.formatMessage({ id: 'NFT_TRANSFER_TEXT' })}
                </div>

                <Form id="send" className={styles.form} onSubmit={handleSubmit(vm.submit)}>
                    <Card>
                        <div className={styles.item}>
                            <UserInfo className={styles.user} account={vm.account} />
                        </div>
                        <div className={styles.item}>
                            <NftItem layout="row" item={vm.transfer.nft} />
                        </div>
                    </Card>

                    <FormControl
                        label={intl.formatMessage({ id: 'FORM_RECEIVER_ADDRESS_LABEL' })}
                        invalid={!!formState.errors.recipient}
                    >
                        <Controller
                            name="recipient"
                            defaultValue=""
                            control={control}
                            rules={{
                                required: true,
                                validate: vm.validateAddress,
                            }}
                            render={({ field }) => (
                                <ContactInput
                                    {...field}
                                    autoFocus
                                    type="address"
                                />
                            )}
                        />

                        <ErrorMessage>
                            {formState.errors.recipient?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.recipient?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_RECIPIENT' })}
                            {formState.errors.recipient?.type === 'invalid' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                        </ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <Button
                    form="send"
                    type="submit"
                    disabled={!vm.key}
                    loading={vm.loading}
                >
                    {intl.formatMessage({ id: 'NFT_TRANSFER_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
