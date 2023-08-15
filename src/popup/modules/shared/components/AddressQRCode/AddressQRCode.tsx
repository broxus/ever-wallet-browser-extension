import QRCode from 'react-qr-code'
import { memo } from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'

import { Button } from '../Button'
import { CopyButton } from '../CopyButton'
import styles from './AddressQRCode.module.scss'

interface Props {
    address: string;
    className?: string;
    compact?: boolean;
}

export const AddressQRCode = memo(({ address, className, compact }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <div className={classNames(styles.qrcode, className)}>
            <div className={styles.code}>
                <QRCode value={`ton://chat/${address}`} size={compact ? 104 : 148} />
            </div>
            <div className={styles.address}>
                <div className={styles.label}>
                    {intl.formatMessage({ id: 'ADDRESS_LABEL' })}
                </div>
                <div className={styles.value}>
                    {address}
                </div>
            </div>
            <CopyButton text={address}>
                <Button className={styles.btn} design="contrast" size="s">
                    {Icons.copy}
                    {intl.formatMessage({ id: 'COPY_BTN_TEXT' })}
                </Button>
            </CopyButton>
        </div>
    )
})
