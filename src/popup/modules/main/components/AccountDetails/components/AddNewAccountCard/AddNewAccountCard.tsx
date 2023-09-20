import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { IconButton } from '@app/popup/modules/shared'

import styles from './AddNewAccountCard.module.scss'

interface Props {
    onAddAccount(): void;
}

export const AddNewAccountCard = memo(({ onAddAccount }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <div className={styles.card} onClick={onAddAccount}>
            <IconButton
                design="primary"
                size="m"
                className={styles.btn}
                icon={Icons.plus}
            />
            <div className={styles.title}>
                {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_ACCOUNT_HEADER' })}
            </div>
            <div className={styles.comment}>
                {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_ACCOUNT_NOTE' })}
            </div>
        </div>
    )
})
