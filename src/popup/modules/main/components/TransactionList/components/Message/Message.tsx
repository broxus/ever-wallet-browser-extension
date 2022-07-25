import type nt from '@wallet/nekoton-wasm'
import React, { memo } from 'react'
import { useIntl } from 'react-intl'

import { StoredBriefMessageInfo } from '@app/models'
import { AssetIcon } from '@app/popup/modules/shared'
import { convertAddress, convertCurrency, NATIVE_CURRENCY } from '@app/shared'

const splitAddress = (address: string | undefined) => {
    const half = address != null ? Math.ceil(address.length / 2) : 0
    return half > 0 ? `${address!.slice(0, half)}\n${address!.slice(-half)}` : ''
}

const OPERATION_NAME: { [k in StoredBriefMessageInfo['type']]: string } = {
    transfer: 'Transfer',
    confirm: 'Confirmation',
    deploy: 'Deploy',
}

interface Props {
    tonWalletAsset: nt.TonWalletAsset;
    message: StoredBriefMessageInfo;
}

export const Message = memo(({ tonWalletAsset, message }: Props): JSX.Element => {
    const intl = useIntl()
    const amount = message.data?.amount
    const recipient = message.data?.recipient

    return (
        <div className="transactions-list-item">
            <AssetIcon address="" type="ton_wallet" className="transactions-list-item__logo" />

            <div className="transactions-list-item__scope">
                {amount && (
                    <div className="transactions-list-item__amount">
                        <div className="transactions-list-item__description _expense">
                            -
                            {convertCurrency(amount, 9)}
                            {` ${NATIVE_CURRENCY}`}
                        </div>
                    </div>
                )}

                <div className="transactions-list-item__bottom">
                    <span
                        className="transactions-list-item__description _address"
                        data-tooltip={splitAddress(recipient || tonWalletAsset.address)}
                    >
                        {convertAddress(recipient || tonWalletAsset.address)}
                    </span>
                    <span className="transactions-list-item__description _date">
                        {new Date(message.createdAt * 1000).toLocaleString('default', {
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                        })}
                    </span>
                </div>

                <div className="transactions-list-item__labels">
                    <div className="transactions-list-item__label-in-progress">
                        {intl.formatMessage(
                            { id: 'TRANSACTIONS_LIST_ITEM_LABEL_PROGRESS' },
                            { name: OPERATION_NAME[message.type] },
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})
