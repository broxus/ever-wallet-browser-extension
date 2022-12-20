import type nt from '@wallet/nekoton-wasm'
import { memo } from 'react'
import { useIntl } from 'react-intl'

import { StoredBriefMessageInfo } from '@app/models'
import { convertAddress, convertCurrency, NATIVE_CURRENCY, splitAddress } from '@app/shared'

const OPERATION_NAME: { [k in StoredBriefMessageInfo['type']]: string } = {
    transfer: 'Transfer',
    confirm: 'Confirmation',
    deploy: 'Deploy',
}

interface Props {
    everWalletAsset: nt.TonWalletAsset;
    message: StoredBriefMessageInfo;
}

export const Message = memo(({ everWalletAsset, message }: Props): JSX.Element => {
    const intl = useIntl()
    const amount = message.data?.amount
    const recipient = message.data?.recipient

    return (
        <div className="transactions-list-item _message">
            {amount && (
                <div className="transactions-list-item__amount">
                    <div
                        className="transactions-list-item__description _expense"
                        title={`${convertCurrency(amount, 9)} ${NATIVE_CURRENCY}`}
                    >
                        {convertCurrency(amount, 9)}
                        &nbsp;
                        {NATIVE_CURRENCY}
                    </div>
                </div>
            )}

            <div className="transactions-list-item__bottom">
                <span
                    className="transactions-list-item__description _address"
                    data-tooltip={splitAddress(recipient || everWalletAsset.address)}
                >
                    {convertAddress(recipient || everWalletAsset.address)}
                </span>
                <span className="transactions-list-item__description _date">
                    {new Date(message.createdAt * 1000).toLocaleString('default', {
                        month: 'short',
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
    )
})
