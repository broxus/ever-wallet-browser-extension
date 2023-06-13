import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Nft } from '@app/models'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    PageLoader,
    usePasswordCache,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'
import { EnterSendPassword } from '@app/popup/modules/send'
import { ContactInput } from '@app/popup/modules/contacts'

import { NftItem } from '../NftItem'
import { FormData, PrepareNftTransferViewModel, Step } from './PrepareNftTransferViewModel'

import './PrepareNftTransfer.scss'

interface Props {
    nft: Nft
    onBack: () => void
}

export const PrepareNftTransfer = observer(({ nft, onBack }: Props): JSX.Element => {
    const form = useForm<FormData>()
    const vm = useViewModel(PrepareNftTransferViewModel, model => {
        model.nft = nft
        model.form = form
    })
    const intl = useIntl()
    const passwordCached = usePasswordCache(vm.selectedKey?.publicKey)
    const { setValue, handleSubmit, formState, control } = form

    useEffect(() => {
        if (vm.messageParams && vm.step.value === Step.EnterAddress) {
            setValue('recipient', vm.messageParams.recipient)
        }
    }, [vm.step.value])

    if (vm.step.is(Step.LedgerConnect)) {
        return (
            <LedgerConnector
                onNext={vm.step.callback(Step.EnterAddress)}
                onBack={vm.step.callback(Step.EnterAddress)}
            />
        )
    }

    return (
        <Container className="nft-transfer">
            {vm.ledger.loading && <PageLoader />}

            <Header className="nft-transfer__header">
                <UserInfo account={vm.selectedAccount} />

                {vm.step.value === Step.EnterAddress && (
                    <>
                        <h2 className="nft-transfer__header-title">
                            {intl.formatMessage({ id: 'NFT_TRANSFER_HEADER' })}
                        </h2>
                        <div className="nft-transfer__header-text">
                            {intl.formatMessage({ id: 'NFT_TRANSFER_TEXT' })}
                        </div>
                    </>
                )}
                {vm.step.value === Step.EnterPassword && (
                    <h2 className="nft-transfer__header-title">
                        {passwordCached
                            ? intl.formatMessage({ id: 'NFT_CONFIRM_TRANSACTION_HEADER' })
                            : intl.formatMessage({ id: 'NFT_ENTER_PASSWORD_HEADER' })}
                    </h2>
                )}
            </Header>

            {vm.step.value === Step.EnterAddress && (
                <>
                    <Content>
                        <NftItem layout="row" item={vm.nft} />

                        <form id="send" className="nft-transfer__form" onSubmit={handleSubmit(vm.submitMessageParams)}>
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
                                        size="s"
                                        type="address"
                                    />
                                )}
                            />

                            {formState.errors.recipient && (
                                <ErrorMessage>
                                    {formState.errors.recipient.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                    {formState.errors.recipient.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_RECIPIENT' })}
                                    {formState.errors.recipient.type === 'invalid' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                                </ErrorMessage>
                            )}
                        </form>
                    </Content>

                    <Footer>
                        <ButtonGroup>
                            <Button group="small" design="secondary" onClick={onBack}>
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </Button>
                            <Button form="send" type="submit" disabled={!vm.selectedKey}>
                                {intl.formatMessage({ id: 'NFT_TRANSFER_BTN_TEXT' })}
                            </Button>
                        </ButtonGroup>
                    </Footer>
                </>
            )}

            {vm.step.value === Step.EnterPassword && vm.selectedKey && (
                <EnterSendPassword
                    contractType={vm.everWalletAsset.contractType}
                    keyEntries={vm.selectableKeys.keys}
                    keyEntry={vm.selectedKey}
                    amount={vm.messageParams?.amount}
                    recipient={vm.messageParams?.recipient}
                    fees={vm.fees}
                    error={vm.error}
                    balanceError={vm.balanceError}
                    disabled={vm.loading}
                    context={vm.context}
                    onSubmit={vm.submitPassword}
                    onBack={vm.step.callback(Step.EnterAddress)}
                    onChangeKeyEntry={vm.onChangeKeyEntry}
                />
            )}
        </Container>
    )
})
