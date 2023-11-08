import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'

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
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'

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
                <Navbar close="window" />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'NFT_TOKEN_TRANSFER_HEADER' })}</h2>

                <Form id="send" className="nft-token-transfer__form" onSubmit={handleSubmit(vm.submit)}>
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

                    <FormControl
                        label={(
                            <FormattedMessage
                                id="AMOUNT_INPUT_LABEL"
                                values={{
                                    amount: vm.transfer.nft.balance,
                                    span: (...parts) => <span className={styles.amount}>{parts}</span>,
                                }}
                            />
                        )}
                        invalid={!!formState.errors.count}
                    >
                        <Input
                            suffix={(
                                <button className={styles.suffix} type="button" onClick={handleMax}>
                                    Max
                                </button>
                            )}
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
