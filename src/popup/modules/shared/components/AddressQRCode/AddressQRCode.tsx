import QRCode from 'react-qr-code'
import { memo } from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import CopyIcon from '@app/popup/assets/icons/copy.svg'

import { Button } from '../Button'
import { CopyButton } from '../CopyButton'
import styles from './AddressQRCode.module.scss'

interface Props {
    className?: string;
    address: string;
}

export const AddressQRCode = memo(({ address, className }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <div className={classNames(styles.qrcode, className)}>
            <div className={styles.code}>
                <QRCode value={`ton://chat/${address}`} size={148} />
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
                    <CopyIcon />
                    {intl.formatMessage({ id: 'COPY_BTN_TEXT' })}
                </Button>
            </CopyButton>
        </div>
    )
})
