import type * as nt from '@broxus/ever-wallet-wasm'
import { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BROXUS_SUPPORT_LINK, convertAddress } from '@app/shared'
import { Alert } from '@app/popup/modules/shared/components/Alert/Alert'

import { CopyButton } from '../CopyButton'
import { Checkbox } from '../Checkbox'
import styles from './TransactionTreeSimulationErrorPanel.module.scss'

interface Props {
    errors: nt.TransactionTreeSimulationError[];
    symbol: string;
    confirmed: boolean;
    onConfirmChange: (value: boolean) => void;
}

export const TransactionTreeSimulationErrorPanel = memo(({ errors, symbol, confirmed, onConfirmChange }: Props) => {
    const intl = useIntl()
    const canFixTxError = errors.some(
        (item) => 'code' in item.error && (item.error.code === -14 || item.error.code === -37),
    )

    return (
        <>
            <Alert
                type="error"
                title={intl.formatMessage({
                    id: 'TOKENS_MAY_BE_LOST',
                })}
                body={(
                    <>
                        {errors.map(({ address, error }) => {
                            const copyAddress = (
                                <CopyButton text={address}>
                                    <button type="button" className={styles.button}>
                                        {convertAddress(address)}
                                    </button>
                                </CopyButton>
                            )
                            if (error.type === 'compute_phase') {
                                return (
                                    <div>
                                        <FormattedMessage
                                            id="TX_ERROR_COMPUTE_PHASE"
                                            values={{
                                                address: () => copyAddress, // eslint-disable-line react/no-unstable-nested-components
                                                code: error.code,
                                            }}
                                        />
                                    </div>
                                )
                            }
                            if (error.type === 'action_phase') {
                                return (
                                    <div>
                                        <FormattedMessage
                                            id="TX_ERROR_ACTION_PHASE"
                                            values={{
                                                address: () => copyAddress, // eslint-disable-line react/no-unstable-nested-components
                                                code: error.code,
                                            }}
                                        />
                                    </div>
                                )
                            }
                            if (error.type === 'frozen') {
                                return (
                                    <div>
                                        <FormattedMessage
                                            id="TX_ERROR_FROZEN"
                                            values={{
                                                address: () => copyAddress, // eslint-disable-line react/no-unstable-nested-components
                                            }}
                                        />
                                    </div>
                                )
                            }
                            if (error.type === 'deleted') {
                                return (
                                    <div>
                                        <FormattedMessage
                                            id="TX_ERROR_DELETED"
                                            values={{
                                                address: () => copyAddress, // eslint-disable-line react/no-unstable-nested-components
                                            }}
                                        />
                                    </div>
                                )
                            }
                            return null
                        })}
                        {canFixTxError ? (
                            <div>
                                Send 0.2 {symbol} to this address or contact <a href={BROXUS_SUPPORT_LINK} target="_blank" rel="nofollow noopener noreferrer">technical support</a>.
                            </div>
                        ) : (
                            <div>
                                Contact <a href={BROXUS_SUPPORT_LINK} target="_blank" rel="nofollow noopener noreferrer">technical support</a>.
                            </div>
                        )}
                    </>
                )}
            />

            <Checkbox
                className={styles.checkbox}
                checked={confirmed}
                onChange={(e) => onConfirmChange(e.target.checked)}
            >
                {intl.formatMessage({ id: 'TX_SEND_TRANSACTION_ANYWAY' })}
            </Checkbox>
        </>
    )
})
