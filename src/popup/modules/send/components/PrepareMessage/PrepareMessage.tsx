import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { amountPattern, convertCurrency, MULTISIG_UNCONFIRMED_LIMIT, SelectedAsset } from '@app/shared'
import { AmountInput, AssetSelect, Button, Card, Checkbox, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Input, Navbar, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'

import { MessageFormData, PrepareMessageViewModel } from './PrepareMessageViewModel'
import styles from './PrepareMessage.module.scss'

export const PrepareMessage = observer((): JSX.Element => {
    const vm = useViewModel(PrepareMessageViewModel, (model) => {
        model.setFormError = (...args) => setError(...args)
    })
    const form = useForm<MessageFormData>({
        defaultValues: {
            recipient: vm.transfer.messageParams?.recipient ?? vm.transfer.initialAddress,
            amount: vm.transfer.messageParams?.originalAmount ?? '',
            comment: vm.transfer.messageParams?.comment ?? '',
            notify: vm.transfer.messageParams?.notify ?? false,
        },
    })

    const [isDens, setIsDens] = useState(() => vm.isDens(form.getValues().recipient))
    const intl = useIntl()
    const { register, handleSubmit, formState, control, watch, setError, setValue } = form

    const handleMax = useCallback(() => {
        let value = convertCurrency(vm.balance, vm.decimals)

        if (vm.asset.type === 'ever_wallet') { // native currency
            value = BigNumber.max(0, BigNumber.sum(value, '-0.1')).toFixed()
        }

        setValue('amount', value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        })
    }, [setValue])

    const handleChangeAsset = useCallback((value: SelectedAsset) => {
        vm.onChangeAsset(value)
        setValue('amount', '')
    }, [setValue])

    useEffect(() => {
        const { unsubscribe } = watch(({ recipient }, { name }) => {
            if (name !== 'recipient') return
            setIsDens(vm.isDens(recipient))
        })

        return unsubscribe
    }, [watch])

    return (
        <Container>
            <Header>
                <Navbar close="window">
                    {intl.formatMessage({ id: 'SEND_MESSAGE_PANEL_FROM_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <Form id="send" onSubmit={handleSubmit(vm.submit)}>
                    <Card>
                        <div className={styles.item}>
                            <UserInfo account={vm.account} />
                        </div>
                    </Card>

                    <FormControl invalid={!!formState.errors.recipient}>
                        <Controller
                            name="recipient"
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
                                    placeholder={intl.formatMessage({ id: 'FORM_RECEIVER_ADDRESS_PLACEHOLDER' })}
                                />
                            )}
                        />

                        <ErrorMessage>
                            {formState.errors.recipient?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.recipient?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_RECIPIENT' })}
                            {formState.errors.recipient?.type === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                            {formState.errors.recipient?.type === 'invalid' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                        </ErrorMessage>
                    </FormControl>

                    <Card className={styles.amount}>
                        <div className={styles.item}>
                            <div className={styles.asset}>
                                <AssetSelect
                                    className={styles.select}
                                    value={vm.asset}
                                    address={vm.account.tonWallet.address}
                                    onChange={handleChangeAsset}
                                />
                                <Button
                                    size="s"
                                    design="contrast"
                                    className={styles.max}
                                    onClick={handleMax}
                                >
                                    Max
                                </Button>
                            </div>
                        </div>

                        <div className={styles.item}>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{
                                    required: true,
                                    pattern: amountPattern(vm.decimals),
                                    validate: {
                                        invalidAmount: vm.validateAmount,
                                        insufficientBalance: vm.validateBalance,
                                    },
                                }}
                                render={({ field }) => (
                                    <AmountInput
                                        {...field}
                                        asset={vm.asset}
                                        error={formState.errors.amount && (
                                            <ErrorMessage>
                                                {formState.errors.amount.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                                {formState.errors.amount.type === 'invalidAmount' && intl.formatMessage({ id: 'ERROR_INVALID_AMOUNT' })}
                                                {formState.errors.amount.type === 'insufficientBalance' && intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })}
                                                {formState.errors.amount.type === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                                            </ErrorMessage>
                                        )}
                                    />
                                )}
                            />
                        </div>
                    </Card>

                    {!vm.commentVisible && (
                        <Button
                            design="ghost"
                            size="s"
                            className={styles.add}
                            onClick={vm.showComment}
                        >
                            {Icons.plus}
                            {intl.formatMessage({ id: 'ADD_COMMENT' })}
                        </Button>
                    )}

                    {vm.commentVisible && (
                        <FormControl>
                            <Input
                                type="text"
                                placeholder={intl.formatMessage({ id: 'FORM_COMMENT_PLACEHOLDER' })}
                                {...register('comment')}
                            />
                        </FormControl>
                    )}

                    {vm.asset.type === 'token_wallet' && (
                        <Checkbox labelPosition="after" className={styles.checkbox} {...register('notify')}>
                            {intl.formatMessage({ id: 'SEND_MESSAGE_NOTIFY_CHECKBOX_LABEL' })}
                        </Checkbox>
                    )}
                </Form>
            </Content>

            <Footer className={styles.footer}>
                <div className={styles.footerInfo}>
                    {formState.touchedFields.recipient && isDens && (
                        <div className={styles.footerHint}>
                            {intl.formatMessage({ id: 'SEND_MESSAGE_DENS_RECIPIENT_HINT' })}
                        </div>
                    )}
                    {vm.isMultisigLimit && (
                        <ErrorMessage>
                            {intl.formatMessage(
                                { id: 'ERROR_MULTISIG_LIMIT' },
                                { count: MULTISIG_UNCONFIRMED_LIMIT },
                            )}
                        </ErrorMessage>
                    )}
                </div>
                <Button
                    form="send"
                    type="submit"
                    // disabled={!vm.key || vm.isMultisigLimit || !formState.isValid}
                >
                    {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
