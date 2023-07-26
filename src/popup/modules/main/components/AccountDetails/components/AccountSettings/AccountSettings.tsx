import { memo } from 'react'
import { useIntl } from 'react-intl'

import EditIcon from '@app/popup/assets/icons/edit.svg'
import CheckboxIcon from '@app/popup/assets/icons/checkbox-active.svg'
import PlanetIcon from '@app/popup/assets/icons/planet.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import { Button, Container, Content } from '@app/popup/modules/shared'

import './AccountSettings.scss'

type Props = {
    onRename(): void;
    onOpenInExplorer(): void;
    onVerify?(): void;
    onRemove?(): void;
}

export const AccountSettings = memo((props: Props): JSX.Element => {
    const { onRename, onVerify, onRemove, onOpenInExplorer } = props
    const intl = useIntl()

    return (
        <Container className="account-settings">
            <Content>
                <h2>{intl.formatMessage({ id: 'ACCOUNT_SETTINGS_TITLE' })}</h2>

                <div className="account-settings__menu">
                    <Button design="ghost" className="account-settings__btn" onClick={onRename}>
                        {intl.formatMessage({ id: 'RENAME' })}
                        <EditIcon />
                    </Button>
                    {onVerify && (
                        <Button design="ghost" className="account-settings__btn" onClick={onVerify}>
                            {intl.formatMessage({ id: 'VERIFY_ON_LEDGER' })}
                            <CheckboxIcon />
                        </Button>
                    )}
                    <Button design="ghost" className="account-settings__btn" onClick={onOpenInExplorer}>
                        {intl.formatMessage({ id: 'VIEW_IN_EXPLORER_BTN_TEXT' })}
                        <PlanetIcon />
                    </Button>
                    {onRemove && (
                        <Button design="alert" className="account-settings__btn" onClick={onRemove}>
                            {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                            <DeleteIcon />
                        </Button>
                    )}
                </div>
            </Content>
        </Container>
    )
})
