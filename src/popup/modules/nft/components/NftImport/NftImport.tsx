import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Input,
    useDrawerPanel,
    useViewModel,
} from '@app/popup/modules/shared'

import { ImportFormData, NftImportViewModel } from './NftImportViewModel'

import './NftImport.scss'

export const NftImport = observer((): JSX.Element => {
    const drawer = useDrawerPanel()
    const form = useForm<ImportFormData>()
    const vm = useViewModel(NftImportViewModel, (model) => {
        model.drawer = drawer
        model.form = form
    })
    const intl = useIntl()
    const { register, handleSubmit, formState } = form

    return (
        <Container className="nft-import">
            <Header>
                <h2>{intl.formatMessage({ id: 'NFT_IMPORT_HEADER' })}</h2>
            </Header>

            <Content>
                <form id="import" onSubmit={handleSubmit(vm.submitManual)}>
                    <p className="nft-import__hint">
                        {intl.formatMessage({ id: 'NFT_IMPORT_ADDRESS_HINT' })}
                    </p>
                    <Input
                        type="text"
                        placeholder={intl.formatMessage({ id: 'NFT_IMPORT_ADDRESS_INPUT_PLACEHOLDER' })}
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
                </form>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={drawer.close}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button type="submit" form="import" disabled={vm.loading}>
                        {intl.formatMessage({ id: 'NFT_IMPORT_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
