import { memo } from 'react'
import { useIntl } from 'react-intl'

import PlusIcon from '@app/popup/assets/icons/plus.svg'
import { IconButton } from '@app/popup/modules/shared'

import './AddNewAccountCard.scss'

interface Props {
    onClick: () => void;
}

export const AddNewAccountCard = memo(({ onClick }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <div className="new-account" onClick={onClick}>
            <IconButton className="new-account__icon" icon={<PlusIcon />} />
            <div className="new-account__title">
                {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_ACCOUNT_HEADER' })}
            </div>
            <div className="new-account__comment">
                {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_ACCOUNT_NOTE' })}
            </div>
        </div>
    )
})
