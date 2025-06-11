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
    Input,
    Navbar,
    Space,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'

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
                <Navbar close="window">{intl.formatMessage({ id: 'NFT_TRANSFER_HEADER' })}</Navbar>
            </Header>

            <Content>
                <div className={styles.text}>
                    {intl.formatMessage({ id: 'NFT_TRANSFER_TEXT' })}
                </div>

                <Form id="send" className={styles.form} onSubmit={handleSubmit(vm.submit)}>
                    <Space direction="column" gap="m">
                        <Card
                            size="s" bg="layer-1" padding="xs"
                            className={styles.user}
                        >
                            <UserInfo account={vm.account} />
                        </Card>
                        <NftItem layout="row" item={vm.transfer.nft} />

                        <FormControl
                            invalid={!!formState.errors.recipient}
                        >
                            <Controller
                                name="recipient"
                                control={control}
                                rules={{ required: true, validate: vm.validateAddress }}
                                render={({ field }) => (
                                    <Input
                                        prefix={intl.formatMessage(
                                            { id: 'NFT_TRANSACTION_DIRECTION_TO' },
                                        )}
                                        placeholder={intl.formatMessage({ id: 'SEND_MESSAGE_RECIPIENT_FIELD_PLACEHOLDER' })}
                                        showReset
                                        size="xs"
                                        type="address"
                                        {...field}
                                    />
                                )}
                            />

                            <ErrorMessage>
                                {formState.errors.recipient?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                {formState.errors.recipient?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_RECIPIENT' })}
                                {formState.errors.recipient?.type === 'invalid' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                            </ErrorMessage>
                        </FormControl>
                    </Space>
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
