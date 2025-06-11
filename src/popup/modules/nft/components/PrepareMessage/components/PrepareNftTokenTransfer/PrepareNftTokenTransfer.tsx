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
    Hint,
    Input,
    Navbar,
    Space,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'

import { NftItem } from '../../../NftItem'
import { FormData, PrepareNftTokenTransferViewModel } from './PrepareNftTokenTransferViewModel'
import styles from './PrepareNftTokenTransfer.module.scss'

export const PrepareNftTokenTransfer = observer((): JSX.Element => {
    const vm = useViewModel(PrepareNftTokenTransferViewModel, model => {
        model.setFormError = (...args) => setError(...args)
    })
    const intl = useIntl()
    const { handleSubmit, formState, control, register, setValue, setError } = useForm<FormData>({
        defaultValues: {
            recipient: vm.transfer.messageParams?.recipient ?? '',
            count: vm.transfer.messageParams?.count ?? '',
        },
    })

    const handleMax = () => setValue('count', vm.transfer.nft.balance ?? '')

    return (
        <Container className="nft-token-transfer">
            <Header>
                <Navbar close="window">{intl.formatMessage({ id: 'NFT_TOKEN_TRANSFER_HEADER' })}</Navbar>
            </Header>

            <Content>
                <Form id="send" className="nft-token-transfer__form" onSubmit={handleSubmit(vm.submit)}>
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

                        <FormControl
                            invalid={!!formState.errors.count}
                        >
                            <Input
                                suffix={(
                                    <Button
                                        size="s"
                                        design="neutral"
                                        className={styles.max}
                                        onClick={handleMax}
                                    >
                                        Max
                                    </Button>
                                )}
                                prefix={intl.formatMessage(
                                    { id: 'AMOUNT_INPUT_LABEL' },
                                )}
                                size="xs"
                                placeholder="0"
                                {...register('count', {
                                    required: true,
                                    pattern: /^\d+$/,
                                    validate: {
                                        invalidAmount: vm.validateAmount,
                                        insufficientBalance: vm.validateBalance,
                                    },
                                })}
                            />
                            <ErrorMessage>
                                {formState.errors.count?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                {formState.errors.count?.type === 'invalidAmount' && intl.formatMessage({ id: 'ERROR_INVALID_AMOUNT' })}
                                {formState.errors.count?.type === 'insufficientBalance' && intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })}
                                {formState.errors.count?.type === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                            </ErrorMessage>
                            <Hint>
                                {intl.formatMessage({ id: 'BALANCE_INPUT_LABEL' }, { amount: vm.transfer.nft.balance })}
                            </Hint>
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
