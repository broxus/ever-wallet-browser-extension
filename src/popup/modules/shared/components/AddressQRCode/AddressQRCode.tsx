import QRCode from 'react-qr-code'
import { memo } from 'react'
import classNames from 'classnames'

import CopyIcon from '@app/popup/assets/icons/copy.svg'

import { CopyText } from '../CopyText'

import './AddressQRCode.scss'

interface Props {
    className?: string;
    address: string;
}

export const AddressQRCode = memo(({ address, className }: Props): JSX.Element => (
    <div className={classNames('address-qr-code', className)}>
        <div className="address-qr-code__code">
            <QRCode value={`ton://chat/${address}`} size={80} />
        </div>
        <div className="address-qr-code__address">
            <CopyText text={address} />
        </div>
        <CopyIcon className="address-qr-code__icon" />
    </div>
))
