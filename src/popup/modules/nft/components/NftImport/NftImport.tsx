import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import {
    Button,
    ButtonGroup,
    Checkbox,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Input,
    Loader,
    Tabs,
    useDrawerPanel,
    useViewModel,
} from '@app/popup/modules/shared'

import { NftItem } from '../NftItem'
import { ImportFormData, NftImportViewModel, Tab } from './NftImportViewModel'

import './NftImport.scss'

export const NftImport = observer((): JSX.Element => {
    const drawer = useDrawerPanel()
    const vm = useViewModel(NftImportViewModel, (model) => {
        model.drawer = drawer
    })
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<ImportFormData>()

    return (
        <Container className="nft-import">
            <Header>
                <h2>{intl.formatMessage({ id: 'NFT_IMPORT_HEADER' })}</h2>
            </Header>

            <Content>
                {vm.accountPendingNfts.length > 0 && (
                    <Tabs className="nft-import__tabs" tab={vm.tab.value} onChange={vm.tab.setValue}>
                        <Tabs.Tab id={Tab.Automatical}>
                            {intl.formatMessage({ id: 'NFT_IMPORT_TAB_AUTOMATICAL' })}
                        </Tabs.Tab>
                        <Tabs.Tab id={Tab.Manual}>
                            {intl.formatMessage({ id: 'NFT_IMPORT_TAB_MANUAL' })}
                        </Tabs.Tab>
                    </Tabs>
                )}
                {vm.tab.is(Tab.Automatical) && (
                    <form id="import" onSubmit={handleSubmit(vm.submitAutomatical)}>
                        {!vm.initialized && (
                            <div className="nft-import__loader">
                                <Loader />
                            </div>
                        )}
                        {vm.initialized && (
                            <div className="nft-import__list">
                                {vm.accountPendingNfts.map(({ address }) => {
                                    if (!vm.nfts[address]) return null

                                    return (
                                        <div className="nft-import__list-item" key={address}>
                                            <NftItem
                                                className="nft-import__list-item-nft"
                                                layout="row"
                                                item={vm.nfts[address]}
                                            />
                                            <Checkbox
                                                className="nft-import__list-item-cb"
                                                checked={vm.checked.has(address)}
                                                onChange={(value) => vm.updateChecked(address, value)}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </form>
                )}
                {vm.tab.is(Tab.Manual) && (
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
                        </ErrorMessage>
                    </form>
                )}
                <ErrorMessage>{vm.error}</ErrorMessage>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={drawer.close}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button type="submit" form="import" disabled={!vm.initialized}>
                        {vm.tab.is(Tab.Automatical) && vm.checked.size === 0
                            ? intl.formatMessage({ id: 'NFT_APPLY_BTN_TEXT' })
                            : intl.formatMessage({ id: 'NFT_IMPORT_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
