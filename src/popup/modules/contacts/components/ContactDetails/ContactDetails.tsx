import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    CopyButton,
    DropdownMenu,
    Footer,
    Header,
    SlidingPanel,
    UserAvatar,
    useViewModel,
} from '@app/popup/modules/shared'
import CrossIcon from '@app/popup/assets/icons/cross.svg'
import EditIcon from '@app/popup/assets/icons/edit.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import CopyIcon from '@app/popup/assets/icons/copy.svg'

import { EditContact } from '../EditContact'
import { ContactDetailsViewModel } from './ContactDetailsViewModel'

import './ContactDetails.scss'

interface Props {
    address: string;
    onClose(): void;
}

const editIcon = <EditIcon />
const deleteIcon = <DeleteIcon />

export const ContactDetails = observer(({ address, onClose }: Props): JSX.Element | null => {
    const vm = useViewModel(ContactDetailsViewModel, (model) => {
        model.address = address
        model.onClose = onClose
    }, [address, onClose])
    const intl = useIntl()

    if (!vm.contact) return null

    return (
        <>
            <Container className="contact-details">
                <Header className="contact-details__header">
                    <h2>{vm.contact.name}</h2>
                    <div className="contact-details__header-buttons">
                        <DropdownMenu>
                            <DropdownMenu.Item icon={editIcon} onClick={vm.openEdit}>
                                {intl.formatMessage({ id: 'CONTACT_EDIT_NAME' })}
                            </DropdownMenu.Item>
                            <DropdownMenu.Item danger icon={deleteIcon} onClick={vm.removeContact}>
                                {intl.formatMessage({ id: 'CONTACT_DELETE_CONTACT' })}
                            </DropdownMenu.Item>
                        </DropdownMenu>
                        <button type="button" className="contact-details__header-btn" onClick={onClose}>
                            <CrossIcon />
                        </button>
                    </div>
                </Header>

                <Content className="contact-details__content">
                    <div className="contact-details__address">
                        <UserAvatar className="contact-details__address-avatar" address={vm.contact.address} small />
                        <div className="contact-details__address-text">{vm.contact.address}</div>
                        <CopyButton place="left" text={vm.contact.address}>
                            <button type="button" className="contact-details__address-btn">
                                <CopyIcon />
                            </button>
                        </CopyButton>
                    </div>
                </Content>

                <Footer>
                    <ButtonGroup>
                        <Button group="small" design="secondary" onClick={onClose}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>
                        <Button onClick={vm.handleSend}>
                            {intl.formatMessage({ id: 'SEND_TOKEN_BTN_TEXT' })}
                        </Button>
                    </ButtonGroup>
                </Footer>
            </Container>

            <SlidingPanel active={vm.edit} onClose={vm.closeEdit}>
                <EditContact address={address} onResult={vm.closeEdit} onBack={vm.closeEdit} />
            </SlidingPanel>
        </>
    )
})
