import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'

import styles from './AddNewAccountCard.module.scss'

interface Props {
    onAddAccount(external: boolean): void;
}

export const AddNewAccountCard = memo(({ onAddAccount }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <div className={styles.card}>
            <div className={styles.item} onClick={() => onAddAccount(false)}>
                <div>
                    <div className={styles.title}>
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_ACCOUNT_HEADER' })}
                    </div>
                    <div className={styles.comment}>
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_ACCOUNT_NOTE' })}
                    </div>
                </div>
                {Icons.chevronRight}
            </div>
            <div className={styles.item} onClick={() => onAddAccount(true)}>
                <div>
                    <div className={styles.title}>
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_EXTERNAL_ACCOUNT_HEADER' })}
                    </div>
                    <div className={styles.comment}>
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_EXTERNAL_ACCOUNT_NOTE' })}
                    </div>
                </div>
                {Icons.chevronRight}
            </div>
        </div>
    )
})
