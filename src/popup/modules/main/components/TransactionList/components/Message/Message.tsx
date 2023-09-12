import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useMemo } from 'react'
import { useIntl } from 'react-intl'

import OutSrc from '@app/popup/assets/img/out@2x.png'
import { StoredBriefMessageInfo } from '@app/models'
import { convertAddress, convertCurrency } from '@app/shared'
import { Amount, Chips } from '@app/popup/modules/shared'

import styles from './Message.module.scss'

const OPERATION_NAME: { [k in StoredBriefMessageInfo['type']]: string } = {
    transfer: 'Transfer',
    confirm: 'Confirmation',
    deploy: 'Deploy',
}

interface Props {
    everWalletAsset: nt.TonWalletAsset;
    message: StoredBriefMessageInfo;
    nativeCurrency: string;
}

export const Message = memo(({ everWalletAsset, message, nativeCurrency }: Props): JSX.Element => {
    const intl = useIntl()
    const amount = message.data?.amount
    const recipient = message.data?.recipient
    const time = useMemo(() => new Date(message.createdAt * 1000).toLocaleString('default', {
        hour: 'numeric',
        minute: 'numeric',
    }), [message.createdAt])

    return (
        <div className={styles.message}>
            <div className={styles.data}>
                <div className={styles.amount}>
                    <img className={styles.img} src={OutSrc} alt="" />
                    <Amount value={convertCurrency(amount, 9)} currency={nativeCurrency} />
                </div>

                <div className={styles.info}>
                    <span>{convertAddress(recipient || everWalletAsset.address)}</span>
                    <span>•</span>
                    <span>{time}</span>
                </div>

                <div className={styles.status}>
                    <Chips type="warning">
                        {intl.formatMessage(
                            { id: 'TRANSACTIONS_LIST_ITEM_LABEL_PROGRESS' },
                            { name: OPERATION_NAME[message.type] },
                        )}
                    </Chips>
                </div>
            </div>
        </div>
    )
})
