import QRCode from 'react-qr-code'
import { memo } from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import CopyIcon from '@app/popup/assets/icons/copy.svg'

import { Button } from '../Button'
import { CopyButton } from '../CopyButton'

import './AddressQRCode.scss'

interface Props {
    className?: string;
    address: string;
}

export const AddressQRCode = memo(({ address, className }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <div className={classNames('address-qr-code', className)}>
            <div className="address-qr-code__code">
                <QRCode value={`ton://chat/${address}`} size={148} />
            </div>
            <div className="address-qr-code__address">
                <div className="address-qr-code__address-label">
                    {intl.formatMessage({ id: 'ADDRESS_LABEL' })}
                </div>
                <div className="address-qr-code__address-value">
                    {address}
                </div>
            </div>
            <CopyButton text={address}>
                <Button className="address-qr-code__btn" design="secondary" size="s">
                    <CopyIcon className="address-qr-code__icon" />
                    {intl.formatMessage({ id: 'COPY_BTN_TEXT' })}
                </Button>
            </CopyButton>
        </div>
    )
})
